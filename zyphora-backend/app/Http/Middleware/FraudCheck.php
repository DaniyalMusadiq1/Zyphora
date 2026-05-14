<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class FraudCheck
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && ($user->is_banned || (float) $user->fraud_score >= 0.85)) {
            abort(Response::HTTP_FORBIDDEN, 'Account restricted.');
        }

        return $next($request);
    }
}
