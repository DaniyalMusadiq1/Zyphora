<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class DeviceRestriction
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $deviceHeader = (string) $request->header('X-Device-Id', '');

        if ($user && $deviceHeader !== '' && $user->device_id && $user->device_id !== $deviceHeader) {
            abort(Response::HTTP_FORBIDDEN, 'Device mismatch.');
        }

        return $next($request);
    }
}
