<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kyc_verifications', function (Blueprint $table) {
            if (!Schema::hasColumn('kyc_verifications', 'document_type')) {
                $table->string('document_type')->nullable()->after('status');
            }
            if (!Schema::hasColumn('kyc_verifications', 'document_front')) {
                $table->text('document_front')->nullable()->after('document_type');
            }
            if (!Schema::hasColumn('kyc_verifications', 'document_back')) {
                $table->text('document_back')->nullable()->after('document_front');
            }
            if (!Schema::hasColumn('kyc_verifications', 'selfie')) {
                $table->text('selfie')->nullable()->after('document_back');
            }
            if (!Schema::hasColumn('kyc_verifications', 'liveness_check')) {
                $table->boolean('liveness_check')->default(false)->after('selfie');
            }
            if (!Schema::hasColumn('kyc_verifications', 'admin_notes')) {
                $table->text('admin_notes')->nullable()->after('liveness_check');
            }
            if (!Schema::hasColumn('kyc_verifications', 'reviewed_by')) {
                $table->foreignId('reviewed_by')->nullable()->constrained('admins')->nullOnDelete()->after('admin_notes');
            }
            if (!Schema::hasColumn('kyc_verifications', 'reviewed_at')) {
                $table->timestamp('reviewed_at')->nullable()->after('reviewed_by');
            }
            
            // Add index for status filtering
            $table->index('status');
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::table('kyc_verifications', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'status']);
            $table->dropIndex('status');
            $table->dropForeign(['reviewed_by']);
            $table->dropColumn([
                'document_type',
                'document_front',
                'document_back',
                'selfie',
                'liveness_check',
                'admin_notes',
                'reviewed_by',
                'reviewed_at',
            ]);
        });
    }
};
