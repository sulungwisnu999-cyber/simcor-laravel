<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StdRules;
use Illuminate\Http\Request;

class StdRulesController extends Controller
{
    public function show(Request $request)
    {
        $record = StdRules::where('user_id', $request->user()->id)->first();
        return response()->json($record?->data);
    }

    public function store(Request $request)
    {
        $data = $request->validate(['data' => 'required|array']);

        StdRules::updateOrCreate(
            ['user_id' => $request->user()->id],
            ['data' => $data['data']]
        );

        return response()->json(['ok' => true]);
    }
}
