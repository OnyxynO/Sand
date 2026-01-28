<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type')->comment('Type de notification');
            $table->string('titre');
            $table->text('message');
            $table->jsonb('donnees')->nullable()->comment('Donnees supplementaires');
            $table->boolean('est_lu')->default(false);
            $table->timestamp('lu_le')->nullable();
            $table->timestamps();

            // Index pour les notifications non lues
            $table->index(['user_id', 'est_lu']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
