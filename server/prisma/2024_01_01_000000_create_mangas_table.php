<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('mangas', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('author', 150)->nullable();
            $table->enum('status', ['ongoing', 'finished', 'hiatus'])->default('ongoing');

            // --- Campos de Seguridad (Críticos para Google Play) ---
            $table->enum('age_rating', ['G', '13+', '16+', '18+'])->default('G');
            $table->boolean('is_adult')->default(false)->comment('Campo clave para filtrar contenido');
            // --- Fin de Campos de Seguridad ---

            $table->string('cover_url', 500)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mangas');
    }
};