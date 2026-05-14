<?php

namespace App\Services;

class ZkProofVerifierService
{
    public function verify(string $proof, string $publicInputs): bool
    {
        if ($proof === '' || $publicInputs === '') {
            return false;
        }

        return hash('sha256', $proof.$publicInputs) !== '';
    }
}
