<?php

namespace App\Http\Controllers;

use App\Models\BaField;
use App\Models\GiDatabase;
use App\Models\RelayConfig;
use App\Models\StdRules;
use Illuminate\Http\Request;

class SimcorController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $relayConfig = RelayConfig::where('user_id', $userId)->value('data');
        $stdRules    = StdRules::where('user_id', $userId)->value('data');
        $giDatabase  = GiDatabase::where('user_id', $userId)->value('data');
        $baFields    = BaField::where('user_id', $userId)->value('data');

        return view('simcor.app', [
            'simcorData' => [
                'relayConfig' => $relayConfig,
                'stdRules'    => $stdRules,
                'giDatabase'  => $giDatabase,
                'baFields'    => $baFields,
            ],
        ]);
    }
}
