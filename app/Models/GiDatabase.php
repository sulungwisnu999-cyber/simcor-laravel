<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GiDatabase extends Model
{
    protected $fillable = ['user_id', 'data'];

    protected $casts = ['data' => 'array'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
