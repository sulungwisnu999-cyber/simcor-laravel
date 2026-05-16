<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BaField;
use Illuminate\Http\Request;

class BaFieldsController extends Controller
{
    public function show(Request $request)
    {
        $record = BaField::where('user_id', $request->user()->id)->first();
        return response()->json($record?->data);
    }

    public function store(Request $request)
    {
        $data = $request->validate(['data' => 'required|array']);

        BaField::updateOrCreate(
            ['user_id' => $request->user()->id],
            ['data' => $data['data']]
        );

        return response()->json(['ok' => true]);
    }
}
