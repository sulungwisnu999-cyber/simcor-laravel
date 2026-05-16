<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RelayConfig;
use Illuminate\Http\Request;

class RelayConfigController extends Controller
{
    public function show(Request $request)
    {
        $record = RelayConfig::where('user_id', $request->user()->id)->first();
        return response()->json($record?->data);
    }

    public function store(Request $request)
    {
        $data = $request->validate(['data' => 'required|array']);

        RelayConfig::updateOrCreate(
            ['user_id' => $request->user()->id],
            ['data' => $data['data']]
        );

        return response()->json(['ok' => true]);
    }
}
