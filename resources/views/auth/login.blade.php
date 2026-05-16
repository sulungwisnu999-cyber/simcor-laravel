<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SIMCOR — Login</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',system-ui,sans-serif;background:#eef2f7;display:flex;align-items:center;justify-content:center;min-height:100vh}
.card{background:#fff;border-radius:12px;padding:32px;width:100%;max-width:380px;box-shadow:0 4px 20px rgba(0,0,0,.12)}
.logo{font-size:2rem;font-weight:900;color:#003087;letter-spacing:-1px;text-align:center;margin-bottom:4px}
.subtitle{text-align:center;font-size:.75rem;color:#64748b;margin-bottom:24px}
.field{margin-bottom:14px}
.field label{display:block;font-size:.68rem;font-weight:600;color:#475569;margin-bottom:4px;text-transform:uppercase;letter-spacing:.4px}
.field input{width:100%;padding:8px 10px;border:1px solid #dde3ec;border-radius:6px;font-size:.85rem;color:#1a202c}
.field input:focus{outline:none;border-color:#0057b8;box-shadow:0 0 0 2px rgba(0,87,184,.1)}
.btn{width:100%;padding:9px;background:#003087;color:#fff;border:none;border-radius:6px;font-size:.82rem;font-weight:700;cursor:pointer;margin-top:8px}
.btn:hover{background:#0057b8}
.link{text-align:center;margin-top:14px;font-size:.72rem;color:#64748b}
.link a{color:#0057b8;text-decoration:none;font-weight:600}
.error{color:#dc2626;font-size:.68rem;margin-top:3px}
.errors{background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:8px 10px;margin-bottom:14px;font-size:.7rem;color:#b91c1c}
</style>
</head>
<body>
<div class="card">
  <div class="logo">SIMCOR</div>
  <div class="subtitle">Relay Protection Coordination Tool — PLN</div>

  @if($errors->any())
    <div class="errors">
      @foreach($errors->all() as $error)
        <div>{{ $error }}</div>
      @endforeach
    </div>
  @endif

  <form method="POST" action="{{ route('login') }}">
    @csrf
    <div class="field">
      <label>Email</label>
      <input type="email" name="email" value="{{ old('email') }}" required autofocus>
    </div>
    <div class="field">
      <label>Password</label>
      <input type="password" name="password" required>
    </div>
    <button class="btn" type="submit">Masuk</button>
  </form>

  <div class="link">
    Belum punya akun? <a href="{{ route('register') }}">Daftar</a>
  </div>
</div>
</body>
</html>
