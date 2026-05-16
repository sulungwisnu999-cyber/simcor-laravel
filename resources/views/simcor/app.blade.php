<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<meta name="csrf-token" content="{{ csrf_token() }}">
<title>SIMCOR v8.0 — Standard Rules + Setting Engine | OCR-GFR Relay Coordination</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js"></script>
<link rel="stylesheet" href="{{ asset('css/simcor.css') }}">
</head>
<body>

<div class="hdr">
  <div class="hdr-logo">SIMCOR</div>
  <div class="hdr-info">
    <h1>Simulasi Koordinasi &amp; Setting Engine Rele Proteksi 20 kV — v8</h1>
    <p id="hdr-sub">Standard Rules | Setting Engine | Setting Rele (Manual/Import) | Dual Validator | TFC | 10 Rele | Database GI</p>
  </div>
  <div style="margin-left:auto;display:flex;align-items:center;gap:10px">
    <div class="hdr-ver">v8.0 PLN ⚡</div>
    <span style="font-size:.6rem;color:rgba(255,255,255,.6)">{{ auth()->user()->name }}</span>
    <form method="POST" action="{{ route('logout') }}" style="margin:0">
      @csrf
      <button type="submit" style="background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);color:#fff;font-size:.58rem;padding:3px 8px;border-radius:4px;cursor:pointer;font-weight:600">Keluar</button>
    </form>
  </div>
</div>

<div class="tabs">
  <div class="tab"     onclick="showTab('stdrules')">📐 Standard Rules</div>
  <div class="tab"     onclick="showTab('engine')">⚙️ Setting Engine</div>
  <div class="tab on"  onclick="showTab('settings')">⚡ Setting Rele</div>
  <div class="tab"     onclick="showTab('ca')">📊 Kurva &amp; Analisa</div>
  <div class="tab"     onclick="showTab('validator')">✅ Validator</div>
  <div class="tab"     onclick="showTab('tfc')">🔥 TFC Monitor</div>
  <div class="tab"     onclick="showTab('tms')">🔢 Hitung TMS</div>
  <div class="tab"     onclick="showTab('report')">📋 Laporan BA</div>
  <div class="tab"     onclick="showTab('db')">🗄️ Database GI</div>
  <div class="tab"     onclick="showTab('manual')">📖 Manual</div>
</div>

@include('simcor.partials._body')

<div class="footer">SIMCOR v8.0 — PLN UID Kalbar / Kalselteng / Kaltimra · Relay Protection Coordination Tool</div>

{{-- Server-side data injected for JS init --}}
<script>
window.__SIMCOR_DATA = @json($simcorData);
</script>
<script src="{{ asset('js/simcor.js') }}"></script>
</body>
</html>
