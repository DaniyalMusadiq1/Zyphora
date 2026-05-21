<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::dropIfExists('device_registry');
        
        Schema::create('device_registry', function (Blueprint $table) {
            $table->id();
            $table->string('device_id', 128);
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('location_city', 100)->nullable();
            $table->string('location_country', 2)->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();
            
            $table->unique(['device_id', 'user_id']);
            $table->index('device_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('device_registry');
    }
};