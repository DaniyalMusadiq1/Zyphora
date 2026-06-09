<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyApiSignature
{
    public function handle(Request $request, Closure $next): Response
    {
        // Skip for admin panel and web routes
        if ($request->is('admin*') || ! $request->is('api/*')) {
            return $next($request);
        }

        $secret = (string) config('zyphora.api_hmac_secret');
        if ($secret === '') {
            return $next($request);
        }

        $timestamp = $request->header('X-Timestamp');
        $signature = $request->header('X-Signature');

        if (! $timestamp || ! $signature) {
            abort(Response::HTTP_FORBIDDEN, 'Missing signature headers.');
        }

        if (abs(time() - (int) $timestamp) > 300) {
            abort(Response::HTTP_FORBIDDEN, 'Stale request.');
        }

        $payload = $request->getContent();
        $canonical = $timestamp.'.'.$request->method().'.'.$request->path().'.'.$payload;
        $expected = hash_hmac('sha256', $canonical, $secret);

        if (! hash_equals($expected, $signature)) {
            abort(Response::HTTP_FORBIDDEN, 'Invalid signature.');
        }

        return $next($request);
    }
}