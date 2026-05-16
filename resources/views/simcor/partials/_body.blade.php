<!-- ============ PANE 0: STANDARD RULES ============ -->
<div class="pane" id="pane-stdrules">
<div class="s-wrap">
  <div class="std-section">
    <div class="std-title">📐 Standard Rules — Basis Kesepakatan Bersama UID Kalbar/Kalselteng/Kaltimra</div>
    <div class="std-summary" id="std-summary"><!-- filled by renderStdSummary --></div>
    <div class="std-note-box">
      ℹ️ <b>Fungsi:</b> Semua formula pada <b>Setting Engine</b> mengikuti konfigurasi standar di halaman ini. Edit nilai koefisien (<b>Is × multiplier</b>, <b>t_target</b>, <b>I_ref</b>, <b>multiplier Iinst</b>, <b>TD</b>, <b>Reclose</b>) jika ada perubahan kebijakan atau standar baru.
      Simpan via <b>Export Rules</b> dan restore via <b>Import Rules</b>.
    </div>
    <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px;align-items:center">
      <button class="btn btn-sm" style="background:#be185d;color:#fff" onclick="expandAllStdBays(true)">▾ Expand All</button>
      <button class="btn btn-out btn-sm" onclick="expandAllStdBays(false)">▴ Collapse</button>
      <button class="btn btn-ok btn-sm" onclick="exportStdRules()">⬇ Export Rules</button>
      <button class="btn btn-out btn-sm" onclick="document.getElementById('std-import-file').click()">⬆ Import Rules</button>
      <input type="file" id="std-import-file" accept=".json" style="display:none" onchange="importStdRules(this)">
      <button class="btn btn-warn btn-sm" onclick="resetStdRules()">↺ Reset ke Default</button>
      <button class="btn btn-eng btn-sm" style="margin-left:auto" onclick="showTab('engine')">→ Setting Engine</button>
    </div>
  </div>
  <div id="std-bays-wrap"></div>
  <div class="std-section" style="border-left-color:#64748b">
    <div class="std-title" style="color:#64748b">📘 Legenda Referensi Variabel</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:5px;font-size:.62rem">
      <div><span class="man-code">In</span> — Arus nominal trafo 20kV = MVA×1000/(√3×20)</div>
      <div><span class="man-code">In_150</span> — Arus nominal trafo sisi 150kV</div>
      <div><span class="man-code">IHS_trafo</span> — IHS 3Φ trafo = In/Xt%</div>
      <div><span class="man-code">IHS_trafo_PhN</span> — IHS fasa-netral = IHS_trafo/7.5</div>
      <div><span class="man-code">IHS_20kV</span> — IHS sistem 20kV (incl. Z_150)</div>
      <div><span class="man-code">I_NGR</span> — Arus via NGR = 20kV/(√3×R_NGR)</div>
      <div><span class="man-code">I_beban</span> — Beban maksimum penyulang (input user)</div>
      <div><span class="man-code">KHA</span> — KHA kabel penyulang Outgoing</div>
      <div><span class="man-code">KHA_couple</span> — KHA Coupler 20kV</div>
    </div>
  </div>
</div>
</div>

<!-- ============ PANE 1: SETTING RELE (existing) ============ -->
<div class="pane on" id="pane-settings">
<div class="s-wrap">
  <div class="mode-toggle" id="mode-toggle-wrap">
    <span style="font-size:.62rem;font-weight:700;color:var(--pln);letter-spacing:.5px">MODE:</span>
    <label class="mode-radio on" id="mode-manual-lbl" onclick="setReleMode('manual')">
      <input type="radio" name="rele-mode" value="manual" checked> ✏️ Manual
    </label>
    <label class="mode-radio" id="mode-import-lbl" onclick="setReleMode('import')">
      <input type="radio" name="rele-mode" value="import"> 🔗 Import from Setting Engine
    </label>
    <span class="mode-info" id="mode-info-txt">Mode <b>Manual</b> — user dapat mengisi nilai secara bebas.</span>
  </div>
  <div class="s-card">
    <div class="s-title">Data Sistem &amp; Trafo</div>
    <div class="fgrid">
      <div class="fg"><label>Nama Proyek / Bay</label><input id="sys-name" value="Trafo [NAMA BAY]"></div>
      <div class="fg"><label>GI / Lokasi</label><input id="sys-gi" value="GI [NAMA GI]"></div>
      <div class="fg"><label>Kap. Trafo (MVA)</label><input id="sys-mva" type="number" value="60" step="any" oninput="recalcIn()"></div>
      <div class="fg"><label>Tegangan HV (kV)</label><input id="sys-vhv" type="number" value="150" step="any" oninput="recalcIn()"></div>
      <div class="fg"><label>Tegangan LV (kV)</label><input id="sys-vlv" type="number" value="20"  step="any" oninput="recalcIn()"></div>
      <div class="fg"><label>Vbase Chart (kV)</label><input id="sys-vbase" type="number" value="20" step="any"></div>
      <div class="fg"><label>In Trafo (A) [auto]</label><input id="sys-in" readonly style="background:#f8fafc;color:var(--muted)"></div>
    </div>
    <div style="margin-top:7px;display:flex;gap:5px;flex-wrap:wrap">
      <button class="btn btn-pln btn-sm" onclick="refreshAll()">Refresh Kurva</button>
      <button class="btn btn-ok btn-sm" onclick="exportCfg()">Simpan Config</button>
      <button class="btn btn-out btn-sm" onclick="document.getElementById('fi').click()">Load Config</button>
      <input type="file" id="fi" accept=".json" style="display:none" onchange="loadCfg(this)">
      <button class="btn btn-warn btn-sm" onclick="resetDef()">Reset Default</button>
    </div>
  </div>
  <div class="s-card" style="border-left-color:var(--gfr)">
    <div class="s-title" style="color:var(--gfr)">Data NGR (untuk GFR / SBEF)</div>
    <div class="fgrid">
      <div class="fg"><label>Io Maks NGR (A)</label><input id="ngr-io" type="number" value="300" step="any"></div>
      <div class="fg"><label>Tegangan NGR (V)</label><input id="ngr-v"  type="number" value="11500" step="any"></div>
      <div class="fg"><label>Resistansi NGR (Ohm)</label><input id="ngr-r" type="number" value="40" step="any"></div>
      <div class="fg"><label>Durasi Ketahanan (s)</label><input id="ngr-t" type="number" value="10" step="any"></div>
    </div>
  </div>
  <div style="font-size:.68rem;font-weight:700;color:var(--pln);text-transform:uppercase;letter-spacing:.5px;padding:0 0 5px">
    10 Rele — OCR &amp; GFR Independen
  </div>
  <div class="r-grid" id="relay-grid"></div>
  <p style="text-align:center;color:var(--muted);font-size:.6rem;margin:8px 0 12px">
    Klik header kartu untuk expand | Toggle untuk aktif/nonaktifkan OCR / GFR per rele
  </p>
</div>
</div>

<!-- ============ PANE 2: KURVA & ANALISA (existing) ============ -->
<div class="pane" id="pane-ca">
<div class="ca-wrap">
  <div class="ca-tb">
    <span class="lbl-sm">I min</span>
    <input class="inp-sm" id="ch-imin" type="number" value="1" style="width:52px" oninput="refreshAll()">
    <span class="lbl-sm">I maks OCR</span>
    <input class="inp-sm" id="ch-imax-o" type="number" value="100000" style="width:82px" oninput="refreshAll()">
    <span class="lbl-sm">I maks GFR</span>
    <input class="inp-sm" id="ch-imax-g" type="number" value="5000" style="width:70px" oninput="refreshAll()">
    <span class="lbl-sm">t maks (s)</span>
    <input class="inp-sm" id="ch-tmax" type="number" value="100" style="width:55px" oninput="refreshAll()">
    <button class="btn btn-pln btn-sm" onclick="refreshAll()">Refresh</button>
    <button class="btn-ov btn-sm" id="btn-trafo"  onclick="togOv('trafo')">Trafo</button>
    <button class="btn-ov btn-sm" id="btn-inrush" onclick="togOv('inrush')">Inrush</button>
    <button class="btn-ov btn-sm on" id="btn-ngr"    onclick="togOv('ngr')">NGR</button>
    <button class="btn-ov btn-sm on" id="btn-marker" onclick="togOv('marker')">Marker</button>
    <button class="btn btn-acc btn-sm" onclick="doPrint()">Print</button>
  </div>
  <div class="ca-charts" id="ca-charts">
    <div class="ch-panel">
      <div class="ph ph-o">
        <span>OCR — Over Current Relay</span>
        <span id="ocr-cnt" style="font-size:.57rem;opacity:.75"></span>
      </div>
      <div class="leg" id="leg-o"></div>
      <div class="cv-wrap"><canvas id="cv-o"></canvas></div>
    </div>
    <div class="ch-panel">
      <div class="ph ph-g">
        <span>GFR — Ground Fault Relay</span>
        <span id="gfr-cnt" style="font-size:.57rem;opacity:.75"></span>
      </div>
      <div class="leg" id="leg-g"></div>
      <div class="cv-wrap"><canvas id="cv-g"></canvas></div>
    </div>
  </div>
  <div class="ca-bottom">
    <div class="fault-card">
      <div class="s-title" style="margin-bottom:5px">Titik Arus Gangguan</div>
      <div id="fault-rows"></div>
      <div style="margin-top:4px;display:flex;gap:4px;flex-wrap:wrap;align-items:center">
        <button class="btn btn-pln btn-sm" onclick="addFaultRow()">+ Tambah</button>
        <button class="btn btn-ok btn-sm" onclick="refreshAll()">Hitung &amp; Update</button>
        <span style="font-size:.58rem;color:var(--muted);margin-left:3px">
          <b>Legenda:</b>
          <span class="t-ok">&#9632; TOC</span> &nbsp;
          <span style="color:#075985;font-weight:700">&#9632; DT</span> &nbsp;
          <span class="t-inst">&#9632; I&gt;&gt; OCR</span> &nbsp;
          <span class="t-inst-g">&#9632; Io&gt;&gt; GFR</span> &nbsp;
          <span class="t-inf">&#9632; Bawah pickup</span>
        </span>
      </div>
    </div>
    <div class="dual-tbl">
      <div class="tbl-panel">
        <div class="tbl-ph tbl-ph-o">Analisa Waktu Trip — OCR</div>
        <div class="tbl-sc">
          <table class="tbl-ocr" id="tbl-o">
            <thead><tr><th>Arus (A)</th><th>Keterangan</th></tr></thead>
            <tbody id="body-o"><tr><td colspan="2" class="empty">Klik Hitung &amp; Update</td></tr></tbody>
          </table>
        </div>
      </div>
      <div class="tbl-panel">
        <div class="tbl-ph tbl-ph-g">Analisa Waktu Trip — GFR</div>
        <div class="tbl-sc">
          <table class="tbl-gfr" id="tbl-g">
            <thead><tr><th>Arus (A)</th><th>Keterangan</th></tr></thead>
            <tbody id="body-g"><tr><td colspan="2" class="empty">Klik Hitung &amp; Update</td></tr></tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>
</div>

<!-- ============ PANE 3: HITUNG TMS (existing) ============ -->
<div class="pane" id="pane-tms">
<div class="a-wrap">
  <div class="s-card">
    <div class="s-title">Kalkulator TMS</div>
    <p style="font-size:.68rem;color:var(--muted);margin-bottom:8px">Hitung TMS dari target waktu trip, atau hitung waktu trip dari nilai TMS yang diketahui.</p>
    <div class="fgrid" style="margin-bottom:7px">
      <div class="fg"><label>Arus Gangguan (A)</label><input id="ti-I"  type="number" value="3000" step="any"></div>
      <div class="fg"><label>I&gt; / Io&gt; Pickup (A)</label><input id="ti-Is" type="number" value="360"  step="any"></div>
      <div class="fg"><label>Karakteristik</label><select id="ti-char"></select></div>
      <div class="fg"><label>Target Waktu (s) [cari TMS]</label><input id="ti-t"   type="number" value="0.3"  step="any"></div>
      <div class="fg"><label>Nilai TMS [cari Waktu Trip]</label><input id="ti-tms" type="number" value="0.3"  step="any"></div>
    </div>
    <div style="display:flex;gap:5px;flex-wrap:wrap">
      <button class="btn btn-pln" onclick="calcTMSresult()">Hitung TMS dari Waktu Target</button>
      <button class="btn btn-ok"  onclick="calcTimeResult()">Hitung Waktu Trip dari TMS</button>
    </div>
    <div id="tms-out" style="margin-top:8px;padding:9px;background:#f0f4f8;border-radius:6px;font-size:.75rem;display:none"></div>
  </div>
  <div class="s-card" style="border-left-color:var(--ok)">
    <div class="s-title" style="color:var(--ok)">Referensi Formula Kurva (IEC 60255 + IEEE C37.112)</div>
    <div style="overflow-x:auto">
      <table style="font-size:.64rem">
        <thead><tr><th>Kode</th><th>Nama Kurva</th><th>Std</th><th>Formula: t = TMS x [...]</th><th>k</th><th>Alpha</th><th>B</th></tr></thead>
        <tbody id="ftbl"></tbody>
      </table>
    </div>
  </div>
</div>
</div>

<!-- ============ PANE 4: SETTING ENGINE ============ -->
<div class="pane" id="pane-engine">
<div class="s-wrap">
  <div class="eng-section">
    <div class="eng-title">⚙️ Setting Engine — Pilih GI / Bay dari Database</div>
    <p style="font-size:.67rem;color:var(--muted);margin-bottom:8px">Pilih GI dari database → parameter sistem terisi otomatis → isi data operasional → klik <b>Hitung Otomatis</b>. Formula sesuai <b>Kesepakatan Bersama UID Kalbar/Kalselteng/Kaltimra</b>.</p>

    <!-- ① GI SELECTOR -->
    <div style="background:var(--eng-bg);border:1px solid var(--eng-bd);border-radius:7px;padding:10px;margin-bottom:10px">
      <div style="font-size:.64rem;font-weight:700;color:var(--eng);margin-bottom:6px;text-transform:uppercase;letter-spacing:.4px">① Pilih GI / Trafo dari Database</div>
      <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:6px">
        <input id="eng-gi-search" class="inp-sm" placeholder="Filter nama GI..." style="flex:1;min-width:160px" oninput="filterEngGISelect()">
        <select id="eng-gi-select" style="flex:2;min-width:220px;padding:5px 6px;border:1px solid var(--eng-bd);border-radius:5px;font-size:.73rem;background:#fff" onchange="loadEngGI()">
          <option value="">-- Pilih GI / Trafo --</option>
        </select>
      </div>
      <div id="eng-gi-info" style="display:none">
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:5px;margin-top:6px">
          <div class="result-box"><div class="lbl">GI / Bay</div><div class="val" style="font-size:.75rem;word-break:break-all" id="ei-name">—</div></div>
          <div class="result-box"><div class="lbl">IHS 150kV</div><div class="val" id="ei-ihs">—</div><div class="sub">kA</div></div>
          <div class="result-box hi"><div class="lbl">Rating Trafo</div><div class="val" id="ei-mva">—</div><div class="sub">MVA</div></div>
          <div class="result-box"><div class="lbl">Xt Trafo</div><div class="val" id="ei-xt">—</div><div class="sub">%</div></div>
          <div class="result-box"><div class="lbl">KHA Couple</div><div class="val" id="ei-kha">—</div><div class="sub">A</div></div>
          <div class="result-box"><div class="lbl">KHA</div><div class="val" id="ei-kha-out">—</div><div class="sub">A</div></div>
          <div class="result-box"><div class="lbl">I_beban</div><div class="val" id="ei-ibeban">—</div><div class="sub">A</div></div>
          <div class="result-box"><div class="lbl">In 20kV</div><div class="val" id="ei-in">—</div><div class="sub">A</div></div>
          <div class="result-box"><div class="lbl">IHS Trafo</div><div class="val" id="ei-ihst">—</div><div class="sub">A</div></div>
          <div class="result-box"><div class="lbl">IHS Sistem</div><div class="val" id="ei-ihs20">—</div><div class="sub">A</div></div>
          <div class="result-box"><div class="lbl">I_NGR (40Ω)</div><div class="val" id="ei-ingr">—</div><div class="sub">A</div></div>
        </div>
      </div>
      <!-- Hidden inputs digunakan oleh runSettingEngine() -->
      <input type="hidden" id="eng-mva" value="60">
      <input type="hidden" id="eng-xt" value="12.5">
      <input type="hidden" id="eng-vlv" value="20">
      <input type="hidden" id="eng-ngr" value="40">
      <input type="hidden" id="eng-ihs150" value="8.1">
      <input type="hidden" id="eng-kha-couple" value="1000">
      <input type="hidden" id="eng-ct-p" value="2000">
      <input type="hidden" id="eng-ct-op" value="600">
      <input type="hidden" id="eng-kha" value="400">
    </div>

    <!-- ② PARAMETER OPERASIONAL -->
    <div style="background:#f8fafc;border:1px solid var(--bdr);border-radius:7px;padding:10px;margin-bottom:10px">
      <div style="font-size:.64rem;font-weight:700;color:var(--pln);margin-bottom:6px;text-transform:uppercase;letter-spacing:.4px">② Parameter Operasional</div>
      <div class="fgrid">
        <div class="fg"><label>Beban Maks Penyulang (A)</label><input id="eng-ibeban" type="number" value="200" step="any"></div>
        <div class="fg"><label>NGR Ohm (default 40)</label><input id="eng-ngr-op" type="number" value="40" step="any" oninput="document.getElementById('eng-ngr').value=this.value"></div>
        <div class="fg"><label>Δt Koordinasi Min (s)</label><input id="eng-dt" type="number" value="0.3" step="any"></div>
        <div class="fg"><label>Kurva OCR</label>
          <select id="eng-char-ocr">
            <option value="C_SI" selected>IEC SI</option>
            <option value="C_VI">IEC VI</option>
            <option value="C_EI">IEC EI</option>
          </select>
        </div>
        <div class="fg"><label>Kurva GFR/SBEF</label>
          <select id="eng-char-gfr">
            <option value="C_SI" selected>IEC SI</option>
            <option value="C_VI">IEC VI</option>
          </select>
        </div>
      </div>
    </div>

    <!-- ③ RASIO CT PER BAY (auto-fill dari Database GI kolom 22-33) -->
    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:7px;padding:10px;margin-bottom:10px">
      <div style="font-size:.64rem;font-weight:700;color:#0369a1;margin-bottom:6px;text-transform:uppercase;letter-spacing:.4px">③ Rasio CT per Bay <span style="font-weight:500;color:#475569;text-transform:none">(auto-fill dari Database GI — bisa di-override manual)</span></div>
      <div class="fgrid" style="grid-template-columns:repeat(4,1fr);gap:6px">
        <div class="fg"><label>CT HV Prim (A)</label><input id="eng-ct-hv-prim" type="number" step="any" placeholder="—"></div>
        <div class="fg"><label>CT HV Sec (A)</label><input id="eng-ct-hv-sec" type="number" step="any" placeholder="—"></div>
        <div class="fg"><label>CT LV Prim (A)</label><input id="eng-ct-lv-prim" type="number" step="any" placeholder="—"></div>
        <div class="fg"><label>CT LV Sec (A)</label><input id="eng-ct-lv-sec" type="number" step="any" placeholder="—"></div>
        <div class="fg"><label>CT OGF Prim (A)</label><input id="eng-ct-ogf-prim" type="number" step="any" placeholder="—"></div>
        <div class="fg"><label>CT OGF Sec (A)</label><input id="eng-ct-ogf-sec" type="number" step="any" placeholder="—"></div>
        <div class="fg"><label>CT Coupler Prim (A)</label><input id="eng-ct-coup-prim" type="number" step="any" placeholder="—"></div>
        <div class="fg"><label>CT Coupler Sec (A)</label><input id="eng-ct-coup-sec" type="number" step="any" placeholder="—"></div>
        <div class="fg"><label>CT SBEF Prim (A)</label><input id="eng-ct-sbef-prim" type="number" step="any" placeholder="—"></div>
        <div class="fg"><label>CT SBEF Sec (A)</label><input id="eng-ct-sbef-sec" type="number" step="any" placeholder="—"></div>
        <div class="fg"><label>CT PLTD Prim (A)</label><input id="eng-ct-pltd-prim" type="number" step="any" placeholder="—"></div>
        <div class="fg"><label>CT PLTD Sec (A)</label><input id="eng-ct-pltd-sec" type="number" step="any" placeholder="—"></div>
      </div>
    </div>

    <div style="display:flex;gap:5px;flex-wrap:wrap">
      <button class="btn btn-eng" onclick="runSettingEngine()">🔄 Hitung Otomatis</button>
      <button class="btn btn-ok btn-sm" onclick="applyEngineToRelays()">✔ Terapkan ke Setting Rele</button>
      <button class="btn btn-out btn-sm" onclick="showTab('db')">🗄️ Buka Database GI</button>
    </div>
  </div>

  <div class="eng-section" id="eng-results" style="display:none">
    <div class="eng-title">📋 Rekomendasi Setting — Nilai Primer</div>
    <div class="result-grid" id="eng-sys-info" style="margin-bottom:10px"></div>
    <div id="eng-relay-results"></div>
    <div style="margin-top:8px;padding:7px 10px;background:var(--eng-bg);border-radius:6px;border:1px solid var(--eng-bd);font-size:.62rem;color:var(--eng)">
      ℹ️ <b>Basis:</b> Is_INC=1.2×In | Is_GFR=0.125×I_NGR | Iinst_INC=0.5×IHS_trafo | Iinst_COUP=0.45×IHS_trafo | SBEF via IEC LTI | TMS=t×(M^0.02-1)/0.14
    </div>
  </div>
</div>
</div>

<!-- ============ PANE 5: TFC HEALTH MONITOR ============ -->
<div class="pane" id="pane-tfc">
<div class="s-wrap">
  <div class="tfc-section">
    <div class="tfc-title">🔥 TFC Health Monitor — Ketahanan Termal Trafo (IEEE C57.109)</div>
    <div class="fgrid" style="margin-bottom:8px">
      <div class="fg"><label>Pilih Rating Trafo</label>
        <select id="tfc-mva" onchange="renderTFCHealth()">
          <option value="60">60 MVA (k=384)</option>
          <option value="30">30 MVA (k=96)</option>
          <option value="20">20 MVA (k=42.67)</option>
        </select>
      </div>
      <div class="fg"><label>Nama / ID Trafo</label><input id="tfc-name" value="Trafo 1 — GI [NAMA]" oninput="renderTFCHealth()"></div>
    </div>
    <div id="tfc-health-display"></div>
  </div>
  <div class="tfc-section">
    <div class="tfc-title">+ Input Event Gangguan Baru</div>
    <div class="fgrid" style="margin-bottom:6px">
      <div class="fg"><label>Tanggal</label><input id="tfc-ev-date" type="date"></div>
      <div class="fg"><label>Arus Gangguan (A)</label><input id="tfc-ev-I" type="number" value="5000" step="any"></div>
      <div class="fg"><label>Waktu Trip (s)</label><input id="tfc-ev-t" type="number" value="0.5" step="any"></div>
      <div class="fg"><label>Zona</label>
        <select id="tfc-ev-zona">
          <option>Busbar 20kV</option>
          <option>Zona 1 (0-5 km)</option>
          <option>Zona 2 (5-10 km)</option>
          <option>Zona 3 (&gt;10 km)</option>
        </select>
      </div>
      <div class="fg"><label>Jenis Gangguan</label>
        <select id="tfc-ev-jenis">
          <option>3-fasa</option>
          <option>2-fasa</option>
          <option>1-fasa ke tanah</option>
        </select>
      </div>
      <div class="fg"><label>Rele Trip</label><input id="tfc-ev-rele" placeholder="e.g. INCOMING OCR"></div>
    </div>
    <div style="display:flex;gap:5px;flex-wrap:wrap">
      <button class="btn btn-tfc" onclick="addTFCEvent()">+ Tambah Event</button>
      <button class="btn btn-out btn-sm" onclick="clearTFCEvents()">🗑️ Hapus Semua</button>
      <button class="btn btn-ok btn-sm" onclick="exportTFCCSV()">📊 Export CSV</button>
    </div>
  </div>
  <div class="tfc-section">
    <div class="tfc-title">Riwayat Event Gangguan</div>
    <div style="overflow-x:auto">
      <table class="evt-table">
        <thead><tr><th>#</th><th>Tanggal</th><th>I (A)</th><th>t trip (s)</th><th>Zona</th><th>Jenis</th><th>Rele</th><th>D_event</th><th>D_kumulatif</th><th>Hapus</th></tr></thead>
        <tbody id="tfc-evt-body"><tr><td colspan="10" class="empty">Belum ada event — tambah menggunakan form di atas</td></tr></tbody>
      </table>
    </div>
  </div>
  <div class="tfc-section">
    <div class="tfc-title">Tabel Referensi ISQT — Estimasi Per Zona</div>
    <div id="tfc-ref-table"></div>
  </div>
</div>
</div>

<!-- ============ PANE 6: COORDINATION VALIDATOR ============ -->
<div class="pane" id="pane-validator">
<div class="s-wrap">
  <div class="val-section">
    <div style="font-size:.68rem;font-weight:700;color:var(--ok);margin-bottom:7px;text-transform:uppercase;letter-spacing:.5px">✅ Dual Coordination Validator</div>
    <p style="font-size:.67rem;color:var(--muted);margin-bottom:8px">Validasi <b>2 sumber data paralel</b>: (1) <b>Setting Rele</b> — nilai aktual yang diinput di rele; (2) <b>Setting Engine</b> — nilai hasil kalkulasi otomatis. Perbedaan hasil = indikasi drift / perlu re-apply.</p>
    <div class="s-card" style="border-left-color:#94a3b8;background:#f8fafc">
      <div class="s-title" style="color:var(--muted)">Konfigurasi Pasangan Rele (Upstream → Downstream)</div>
      <div id="val-pairs-grid"></div>
      <button class="btn btn-pln btn-sm" style="margin-top:6px" onclick="addValPair()">+ Tambah Pasangan</button>
    </div>
    <div style="display:flex;gap:5px;margin-bottom:8px;flex-wrap:wrap">
      <button class="btn btn-ok" onclick="runValidation()">▶ Jalankan Dual Validasi</button>
      <button class="btn btn-eng btn-sm" onclick="autoFixSuggestions()">🔧 Hitung Rekomendasi Perbaikan</button>
      <span style="font-size:.6rem;color:var(--muted);align-self:center;margin-left:4px">⚠️ Perbaikan otomatis hanya <b>rekomendasi</b> — tidak overwrite Setting Rele</span>
    </div>
    <div class="val-dual-wrap">
      <div class="val-col">
        <div class="val-col-hdr rele">⚡ Validasi Setting Rele (Tab #3)</div>
        <div id="val-matrix-wrap-rele" style="overflow-x:auto;margin-bottom:6px"></div>
        <div id="val-details-rele"></div>
      </div>
      <div class="val-col">
        <div class="val-col-hdr eng">⚙️ Validasi Setting Engine (Tab #2)</div>
        <div id="val-matrix-wrap-eng" style="overflow-x:auto;margin-bottom:6px"></div>
        <div id="val-details-eng"></div>
      </div>
    </div>
    <div id="val-fix-wrap" style="margin-top:8px"></div>
  </div>
  <div class="val-section">
    <div style="font-size:.68rem;font-weight:700;color:var(--ok);margin-bottom:5px;text-transform:uppercase;letter-spacing:.5px">Referensi Rules</div>
    <table style="font-size:.63rem;width:100%;border-collapse:collapse">
      <thead><tr style="background:#f0fdf4"><th style="padding:4px 8px;text-align:left;border-bottom:2px solid var(--ok)">Rule</th><th style="padding:4px 8px;border-bottom:2px solid var(--ok)">Kriteria</th><th style="padding:4px 8px;border-bottom:2px solid var(--ok)">Standar</th></tr></thead>
      <tbody>
        <tr><td style="padding:3px 8px;border-bottom:1px solid var(--bdr)"><b>V-01</b></td><td style="padding:3px 8px;border-bottom:1px solid var(--bdr)">Δt trip ≥ 0.30 s (upstream - downstream pada I_inst_DS)</td><td style="padding:3px 8px;border-bottom:1px solid var(--bdr);color:var(--muted)">IEC 60255 / Kesepakatan Bersama</td></tr>
        <tr style="background:#f8fafc"><td style="padding:3px 8px;border-bottom:1px solid var(--bdr)"><b>V-02</b></td><td style="padding:3px 8px;border-bottom:1px solid var(--bdr)">Is_upstream / Is_downstream ≥ 1.2</td><td style="padding:3px 8px;border-bottom:1px solid var(--bdr);color:var(--muted)">Kesepakatan Bersama</td></tr>
        <tr><td style="padding:3px 8px;border-bottom:1px solid var(--bdr)"><b>V-03</b></td><td style="padding:3px 8px;border-bottom:1px solid var(--bdr)">Iinst2_DS &lt; Iinst2_US × 0.8 (tidak overlap)</td><td style="padding:3px 8px;border-bottom:1px solid var(--bdr);color:var(--muted)">Best Practice Koordinasi</td></tr>
        <tr style="background:#f8fafc"><td style="padding:3px 8px;border-bottom:1px solid var(--bdr)"><b>V-04</b></td><td style="padding:3px 8px;border-bottom:1px solid var(--bdr)">Stage 3 (Iinst2) → Reclose = DILARANG</td><td style="padding:3px 8px;border-bottom:1px solid var(--bdr);color:var(--muted)">Kesepakatan Bersama</td></tr>
        <tr><td style="padding:3px 8px;border-bottom:1px solid var(--bdr)"><b>V-05</b></td><td style="padding:3px 8px;border-bottom:1px solid var(--bdr)">GFR Incoming - SBEF: Δt ≥ 0.30 s pada I_NGR</td><td style="padding:3px 8px;border-bottom:1px solid var(--bdr);color:var(--muted)">Kesepakatan Bersama</td></tr>
        <tr style="background:#f8fafc"><td style="padding:3px 8px"><b>V-06</b></td><td style="padding:3px 8px">t_SBEF(I_NGR) ≤ 10 s (ketahanan NGR)</td><td style="padding:3px 8px;color:var(--muted)">NGR 300A/10s PLN</td></tr>
      </tbody>
    </table>
  </div>
</div>
</div>

<!-- ============ PANE 7: LAPORAN BA ============ -->
<div class="pane" id="pane-report">
<div class="s-wrap">
  <div class="eng-section">
    <div class="eng-title">📋 Generator Berita Acara — Fleksibel dengan Checklist Konten</div>
    <p style="font-size:.67rem;color:var(--muted);margin-bottom:8px">Pilih bagian yang akan disertakan ke laporan. Urutan cetak mengikuti <b>hirarki checklist</b> di bawah.</p>
    <div class="fgrid" style="margin-bottom:8px">
      <div class="fg"><label>Nomor BA</label><input id="ba-nomor" value="001/BA-PROTEKSI/2026" oninput="saveBaForm()"></div>
      <div class="fg"><label>Tanggal BA</label><input id="ba-date" type="date" oninput="saveBaForm()"></div>
    </div>
    <div style="font-size:.63rem;font-weight:700;color:var(--pln);margin:6px 0 4px;text-transform:uppercase;letter-spacing:.5px">
      Tanda Tangan (Jabatan &amp; Nama — Fleksibel)
    </div>
    <div class="ba-sig-edit">
      <div class="ba-sig-col">
        <div class="ba-sig-hdr">① Dibuat oleh</div>
        <div class="fg"><label>Jabatan</label><input id="ba-sig1-jab" value="" placeholder="[isi jabatan]" oninput="saveBaForm()"></div>
        <div class="fg"><label>Nama</label><input id="ba-sig1-nm" value="" placeholder="[isi nama]" oninput="saveBaForm()"></div>
      </div>
      <div class="ba-sig-col">
        <div class="ba-sig-hdr">② Diperiksa oleh</div>
        <div class="fg"><label>Jabatan</label><input id="ba-sig2-jab" value="" placeholder="[isi jabatan]" oninput="saveBaForm()"></div>
        <div class="fg"><label>Nama</label><input id="ba-sig2-nm" value="" placeholder="[isi nama]" oninput="saveBaForm()"></div>
      </div>
      <div class="ba-sig-col">
        <div class="ba-sig-hdr">③ Disetujui oleh</div>
        <div class="fg"><label>Jabatan</label><input id="ba-sig3-jab" value="" placeholder="[isi jabatan]" oninput="saveBaForm()"></div>
        <div class="fg"><label>Nama</label><input id="ba-sig3-nm" value="" placeholder="[isi nama]" oninput="saveBaForm()"></div>
      </div>
    </div>
    <div style="font-size:.63rem;font-weight:700;color:var(--pln);margin:9px 0 4px;text-transform:uppercase;letter-spacing:.5px">
      Checklist Isi Laporan (urutan cetak = urutan di bawah)
    </div>
    <div class="ba-chk-grid" id="ba-chk-grid">
      <label class="ba-chk on" id="ba-chk-engine-lbl"><input type="checkbox" id="ba-chk-engine" checked onchange="toggleBaChk('engine')"><span class="ba-chk-icon">⚙️</span><span><span class="ba-chk-lbl">I. Setting Engine</span><span class="ba-chk-sub">Hasil kalkulasi otomatis</span></span></label>
      <label class="ba-chk on" id="ba-chk-rele-lbl"><input type="checkbox" id="ba-chk-rele" checked onchange="toggleBaChk('rele')"><span class="ba-chk-icon">⚡</span><span><span class="ba-chk-lbl">II. Setting Rele</span><span class="ba-chk-sub">Nilai aktual per rele</span></span></label>
      <label class="ba-chk on" id="ba-chk-curve-lbl"><input type="checkbox" id="ba-chk-curve" checked onchange="toggleBaChk('curve')"><span class="ba-chk-icon">📊</span><span><span class="ba-chk-lbl">III. Kurva &amp; Analisa</span><span class="ba-chk-sub">Chart TCC + tabel trip</span></span></label>
      <label class="ba-chk on" id="ba-chk-validator-lbl"><input type="checkbox" id="ba-chk-validator" checked onchange="toggleBaChk('validator')"><span class="ba-chk-icon">✅</span><span><span class="ba-chk-lbl">IV. Validator</span><span class="ba-chk-sub">Dual hasil (Rele + Engine)</span></span></label>
      <label class="ba-chk on" id="ba-chk-tfc-lbl"><input type="checkbox" id="ba-chk-tfc" checked onchange="toggleBaChk('tfc')"><span class="ba-chk-icon">🔥</span><span><span class="ba-chk-lbl">V. TFC Monitor</span><span class="ba-chk-sub">IEEE C57.109 ISQT</span></span></label>
    </div>
    <div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:6px">
      <button class="btn btn-pln" onclick="generateBA()">📄 Buat &amp; Print Berita Acara</button>
      <button class="btn btn-ok btn-sm" onclick="previewBA()">👁 Preview BA</button>
      <button class="btn btn-out btn-sm" onclick="toggleAllBaChk(true)">✓ Centang Semua</button>
      <button class="btn btn-out btn-sm" onclick="toggleAllBaChk(false)">☐ Kosongkan</button>
    </div>
  </div>
  <div class="eng-section" id="ba-preview-wrap" style="display:none">
    <div class="eng-title">Preview Berita Acara</div>
    <div id="ba-preview-content" style="font-size:.72rem;line-height:1.6"></div>
  </div>
</div>
</div>

<!-- ============ PANE 8: DATABASE GI ============ -->
<div class="pane" id="pane-db">
<div class="s-wrap">
  <div class="db-section">
    <div class="db-title">🗄️ Database GI — Kalimantan (22 parameter sistem per GI/Trafo)</div>
    <p style="font-size:.67rem;color:var(--muted);margin-bottom:8px">
      Database gardu induk lengkap: arus hubung singkat 150kV (3Φ/1Φ), kapasitas &amp; reaktansi trafo, Inominal HV/LV, impedansi, IHS trafo Ph-Ph / Ph-G di HV &amp; LV, NGR, serta IHS sistem LV. Semua parameter dapat di-pull ke <b>Standard Rules</b> untuk perhitungan Iset &amp; TMS. Klik <b style="color:#0891b2">→ Load</b> untuk memuat ke Setting Engine.
    </p>
    <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px;align-items:center">
      <input id="db-search" class="inp-sm" placeholder="🔍 Cari nama GI..." style="width:160px" oninput="filterGIDB()">
      <select id="db-filter-region" class="inp-sm" onchange="filterGIDB()" style="min-width:120px">
        <option value="">Semua Wilayah</option>
        <option value="KALBAR">UID Kalbar</option>
        <option value="KALSELTENG">UID Kalselteng</option>
        <option value="KALTIMRA">UID Kaltimra</option>
      </select>
      <button class="btn btn-sm" style="background:#0891b2;color:#fff" onclick="addGIRow()">+ Tambah GI</button>
      <button class="btn btn-out btn-sm" onclick="exportGIDB()">⬇ Export CSV</button>
      <button class="btn btn-out btn-sm" onclick="importGIDBFile()">⬆ Import CSV</button>
      <input type="file" id="gi-import-file" accept=".csv,.json,text/csv" style="display:none" onchange="importGIDB(this)">
      <button class="btn btn-out btn-sm" style="opacity:.7" onclick="exportGIDBJSON()" title="Backup JSON (opsional)">⬇ JSON</button>
      <button class="btn btn-warn btn-sm" onclick="resetGIDB()">↺ Reset Default</button>
      <span style="font-size:.6rem;color:var(--muted);margin-left:4px" id="db-count"></span>
    </div>
    <div style="overflow:auto;max-height:calc(100vh - 280px);border:1px solid var(--bdr);border-radius:6px">
      <table class="db-tbl" style="min-width:5500px">
        <thead id="gi-thead"><tr><th colspan="38" style="padding:8px;text-align:center;color:var(--muted)">Memuat header...</th></tr></thead>
        <tbody id="gi-tbody"><tr><td colspan="38" style="padding:20px;text-align:center;color:var(--muted)">Memuat database...</td></tr></tbody>
      </table>
    </div>
    <div style="font-size:.58rem;color:var(--muted);margin-top:6px">
      Wilayah = derived otomatis dari prefix nama GI. Semua kolom numerik di atas (kecuali MVA, Xt, Xt beban 100%, Xt Trafo beban 100%, Vnom HV/LV, NGR, Z HV, Z LV) tersedia sebagai <b>reference variable</b> di dropdown Standard Rules. Gunakan <b>⬇ Export CSV</b> / <b>⬆ Import CSV</b> untuk editing massal di Excel (format EU: <code>;</code> separator, <code>,</code> decimal).
    </div>
  </div>
  <div class="db-section" style="border-left-color:#64748b">
    <div class="db-title" style="color:#64748b">ℹ️ Cara Pakai Database GI</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:.66rem">
      <div>
        <b style="color:var(--pln)">Load ke Setting Engine:</b>
        <ol style="margin:4px 0;padding-left:16px;color:var(--muted);line-height:2">
          <li>Cari GI di kolom pencarian</li>
          <li>Klik <span style="background:#0891b2;color:#fff;padding:1px 6px;border-radius:3px;font-size:.6rem">→ Load</span></li>
          <li>Setting Engine terisi otomatis (IHS, MVA, Xt, KHA)</li>
          <li>Isi beban penyulang → Hitung Otomatis</li>
        </ol>
      </div>
      <div>
        <b style="color:var(--pln)">Edit data:</b>
        <ol style="margin:4px 0;padding-left:16px;color:var(--muted);line-height:2">
          <li>Klik langsung pada sel → ketik nilai baru → Enter (auto-save)</li>
          <li>Tambah entri baru: tombol <b>+ Tambah GI</b></li>
          <li><b>Export CSV</b> → edit massal di Excel (EU format: <code>;</code> &amp; <code>,</code>)</li>
          <li><b>Import CSV</b> → replace seluruh database dari file Excel/CSV</li>
          <li>Kolom dengan tanda ⚙︎ = dapat dipakai di Standard Rules</li>
        </ol>
      </div>
    </div>
  </div>
</div>
</div>

<!-- ============ PANE 9: MANUAL PENGGUNAAN ============ -->
<div class="pane" id="pane-manual">
<div class="s-wrap">

  <!-- OVERVIEW -->
  <div class="man-section">
    <div style="font-size:.85rem;font-weight:700;color:var(--pln);margin-bottom:3px">📖 Manual Penggunaan SIMCOR v8.0</div>
    <div style="font-size:.62rem;color:var(--muted);margin-bottom:8px">Aplikasi Simulasi Koordinasi Rele Proteksi OCR-GFR 20 kV — PLN UID Kalbar / Kalselteng / Kaltimra</div>
    <div class="man-p"><b>SIMCOR</b> adalah aplikasi berbasis web untuk simulasi koordinasi waktu trip rele <b>OCR (Over Current Relay)</b> dan <b>GFR (Ground Fault Relay)</b> pada sistem distribusi 20 kV. Versi v8 memperkenalkan konsep <b>Standard Rules</b> sebagai basis kalkulasi yang dapat dikonfigurasi, mode <b>Manual / Import</b> pada Setting Rele, dan validator ganda yang memvalidasi Setting Rele dan Setting Engine secara paralel.</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:5px;margin:8px 0">
      <div style="background:#fdf2f8;border:1px solid #fbcfe8;border-radius:6px;padding:8px;text-align:center;cursor:pointer" onclick="showTab('stdrules')">
        <div style="font-size:1.3rem">📐</div><div style="font-size:.65rem;font-weight:700;color:#be185d">1. Standard Rules</div><div style="font-size:.57rem;color:var(--muted)">Basis formula Engine</div></div>
      <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:6px;padding:8px;text-align:center;cursor:pointer" onclick="showTab('engine')">
        <div style="font-size:1.3rem">⚙️</div><div style="font-size:.65rem;font-weight:700;color:var(--eng)">2. Setting Engine</div><div style="font-size:.57rem;color:var(--muted)">Hitung otomatis per GI</div></div>
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:8px;text-align:center;cursor:pointer" onclick="showTab('settings')">
        <div style="font-size:1.3rem">⚡</div><div style="font-size:.65rem;font-weight:700;color:var(--ocr)">3. Setting Rele</div><div style="font-size:.57rem;color:var(--muted)">Manual / Import</div></div>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:8px;text-align:center;cursor:pointer" onclick="showTab('ca')">
        <div style="font-size:1.3rem">📊</div><div style="font-size:.65rem;font-weight:700;color:var(--gfr)">4. Kurva TCC</div><div style="font-size:.57rem;color:var(--muted)">Log-log chart</div></div>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:8px;text-align:center;cursor:pointer" onclick="showTab('validator')">
        <div style="font-size:1.3rem">✅</div><div style="font-size:.65rem;font-weight:700;color:var(--ok)">5. Dual Validator</div><div style="font-size:.57rem;color:var(--muted)">Rele + Engine</div></div>
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:8px;text-align:center;cursor:pointer" onclick="showTab('tfc')">
        <div style="font-size:1.3rem">🔥</div><div style="font-size:.65rem;font-weight:700;color:var(--tfc)">6. TFC Monitor</div><div style="font-size:.57rem;color:var(--muted)">IEEE C57.109</div></div>
      <div style="background:#f8fafc;border:1px solid var(--bdr);border-radius:6px;padding:8px;text-align:center;cursor:pointer" onclick="showTab('tms')">
        <div style="font-size:1.3rem">🔢</div><div style="font-size:.65rem;font-weight:700">7. Hitung TMS</div><div style="font-size:.57rem;color:var(--muted)">Kalkulator cepat</div></div>
      <div style="background:#f8fafc;border:1px solid var(--bdr);border-radius:6px;padding:8px;text-align:center;cursor:pointer" onclick="showTab('report')">
        <div style="font-size:1.3rem">📋</div><div style="font-size:.65rem;font-weight:700">8. Laporan BA</div><div style="font-size:.57rem;color:var(--muted)">Checklist fleksibel</div></div>
      <div style="background:#ecfeff;border:1px solid #a5f3fc;border-radius:6px;padding:8px;text-align:center;cursor:pointer" onclick="showTab('db')">
        <div style="font-size:1.3rem">🗄️</div><div style="font-size:.65rem;font-weight:700;color:#0891b2">9. Database GI</div><div style="font-size:.57rem;color:var(--muted)">166+ GI Kalimantan</div></div>
    </div>
  </div>

  <!-- INTERNAL SYSTEM -->
  <div class="man-section" style="border-left-color:#be185d">
    <div class="man-h2" style="color:#be185d;border-color:#be185d">Sistem Internal &amp; Aliran Data v8</div>
    <div class="man-p">Aplikasi v8 menggunakan <b>5 layer data</b> yang saling terhubung. Memahami aliran data ini krusial sebelum menggunakan aplikasi:</div>
    <div style="padding:8px;background:#fdf2f8;border-radius:6px;font-size:.65rem;line-height:1.9">
      <b style="color:#be185d">① Standard Rules</b> — Basis multiplier &amp; target waktu trip untuk seluruh bay. Ditetapkan sesuai Kesepakatan Bersama. <b>Editable.</b><br>
      <b style="color:var(--eng)">② Setting Engine</b> — Menggunakan formula dari Standard Rules + parameter GI (dari Database GI) → menghasilkan rekomendasi setting primer.<br>
      <b style="color:var(--ocr)">③ Setting Rele</b> — 10 slot rele fisik. Dua mode: <b>Manual</b> (input bebas) atau <b>Import from Setting Engine</b> (readonly, mengikuti Engine).<br>
      <b style="color:var(--gfr)">④ Kurva &amp; Analisa</b> — Visualisasi TCC log-log dan analisa waktu trip terhadap titik arus gangguan. <b>Sumber: Setting Rele.</b><br>
      <b style="color:var(--ok)">⑤ Validator</b> — Menjalankan validasi <b>paralel</b> pada Setting Rele dan Setting Engine untuk deteksi drift atau pelanggaran standar.
    </div>
    <div class="man-tip">💡 Tombol <b>✔ Terapkan Setting Rele</b> di Setting Engine akan menyalin hasil Engine → Setting Rele dan mengganti mode Rele ke <b>Import</b>.</div>
    <div class="man-note">⚠️ <b>Hitung Perbaikan Otomatis</b> pada Validator hanya bersifat <b>rekomendasi</b> — tidak mengubah Setting Rele. Engineer harus memutuskan apakah merubah setting manual atau merekalibrasi Standard Rules.</div>
  </div>

  <!-- ALUR KERJA -->
  <div class="man-section">
    <div class="man-h2">Alur Kerja Standar (SOP) v8</div>
    <div class="man-step"><b>① Verifikasi Standard Rules</b> → Tab <i>Standard Rules</i> → periksa nilai multiplier, t_target, Iinst sesuai kesepakatan terakhir. Ubah bila ada revisi.</div>
    <div class="man-step"><b>② Pilih GI dari Database</b> → Tab <i>Database GI</i> → cari GI → klik <b>→ Load</b> (otomatis pindah ke Setting Engine).</div>
    <div class="man-step"><b>③ Isi Parameter Operasional</b> → Tab <i>Setting Engine</i> → isi <b>Beban Penyulang (A)</b>, NGR Ohm, Δt koordinasi, kurva OCR/GFR.</div>
    <div class="man-step"><b>④ Hitung Otomatis</b> → klik <b>🔄 Hitung Otomatis</b> → tabel rekomendasi setting muncul (basis: Standard Rules + parameter GI).</div>
    <div class="man-step"><b>⑤ Terapkan ke Setting Rele</b> → klik <b>✔ Terapkan Setting Rele</b> → Setting Rele masuk mode <b>Import</b>, semua field terkunci.</div>
    <div class="man-step"><b>⑥ Review Kurva TCC</b> → Tab <i>Kurva &amp; Analisa</i> → inspeksi visual koordinasi (margin 0.3 s antar kurva).</div>
    <div class="man-step"><b>⑦ Validasi Ganda</b> → Tab <i>Validator</i> → klik <b>▶ Jalankan Dual Validasi</b> → bandingkan matriks Setting Rele vs Setting Engine.</div>
    <div class="man-step"><b>⑧ Perbaikan (opsional)</b> → Bila ada FAIL/WARN → klik <b>🔧 Hitung Rekomendasi</b> → diskusikan hasilnya → edit manual atau revisi Standard Rules.</div>
    <div class="man-step"><b>⑨ Monitor TFC Trafo</b> → Tab <i>TFC Monitor</i> → catat setiap event gangguan historis → pantau akumulasi D kumulatif.</div>
    <div class="man-step"><b>⑩ Generate Laporan BA</b> → Tab <i>Laporan BA</i> → centang konten yang diperlukan → klik <b>📄 Buat &amp; Print</b>.</div>
  </div>

  <!-- STANDARD RULES -->
  <div class="man-section">
    <div class="man-h2">Tab #1 — Standard Rules</div>
    <div class="man-p">Tab <b>Standard Rules</b> berisi <b>8 bay standar</b> dengan parameter yang dapat diedit. Tiap bay punya fungsi OCR dan/atau GFR dengan 3 stage (TOC, Instant, High Instant).</div>
    <table class="man-tbl">
      <thead><tr><th>Bay</th><th>Fungsi</th><th>Is default</th><th>I_ref TMS</th><th>t_target</th><th>Iinst default</th></tr></thead>
      <tbody>
        <tr><td><b>BPU HV</b></td><td>OCR 150kV</td><td>1.2 × In_150</td><td>IHS_trafo_PhN</td><td>1.3 s</td><td>0.52 × IHS_trafo_PhN</td></tr>
        <tr><td><b>INCOMING</b></td><td>OCR + GFR</td><td>OCR 1.2×In / GFR 0.125×I_NGR</td><td>IHS_trafo / I_NGR</td><td>1.0 s / 1.4 s</td><td>0.5 × IHS_trafo</td></tr>
        <tr><td><b>COUPLE 20kV</b></td><td>OCR + GFR</td><td>OCR min(1.2×KHA,1.2×In) / GFR 0.125×I_NGR</td><td>IHS_trafo / I_NGR</td><td>0.7 s / 1.1 s</td><td>0.45 × IHS_trafo</td></tr>
        <tr><td><b>OUTGOING</b></td><td>OCR + GFR</td><td>OCR 1.2×I_beban / GFR 0.104×I_NGR</td><td>0.4×IHS / I_NGR</td><td>1.0 s / 0.9 s</td><td>0.4×IHS (Stg2) + 0.5×IHS (Stg3)</td></tr>
        <tr><td><b>SBEF-1</b></td><td>GFR LTI</td><td>0.125 × I_NGR</td><td>I_NGR</td><td>5.0 s</td><td>—</td></tr>
        <tr><td><b>SBEF-2</b></td><td>GFR LTI</td><td>0.125 × I_NGR</td><td>I_NGR</td><td>5.5 s</td><td>—</td></tr>
        <tr><td><b>SBEF-3</b></td><td>GFR LTI</td><td>0.125 × I_NGR</td><td>I_NGR</td><td>6.0 s</td><td>—</td></tr>
        <tr><td><b>COUPLE PLTD</b></td><td>OCR + GFR</td><td>OCR 1.2×KHA_couple / GFR 0.125×I_NGR</td><td>IHS_trafo / I_NGR</td><td>0.8 s / 1.2 s</td><td>0.45 × IHS_trafo</td></tr>
      </tbody>
    </table>
    <div class="man-h3">Cara Mengedit Standard Rules</div>
    <div class="man-step"><b>Buka</b> tab Standard Rules → klik pada card bay untuk expand.</div>
    <div class="man-step"><b>Edit nilai multiplier</b> (contoh: ubah <span class="man-code">1.2</span> menjadi <span class="man-code">1.3</span> untuk koefisien Is).</div>
    <div class="man-step"><b>Edit t_target atau Iinst multiplier</b> bila kesepakatan berubah.</div>
    <div class="man-step"><b>Export Rules</b> untuk backup sebelum perubahan besar; <b>Import Rules</b> untuk restore.</div>
    <div class="man-step"><b>Jalankan Setting Engine ulang</b> — formula akan memakai nilai baru dari Standard Rules.</div>
    <div class="man-tip">💡 Data Standard Rules tersimpan otomatis di browser (localStorage). Export JSON untuk berbagi/arsip.</div>
  </div>

  <!-- SETTING ENGINE -->
  <div class="man-section">
    <div class="man-h2">Tab #2 — Setting Engine (Formula Kalkulasi)</div>
    <div class="man-p">Setting Engine menghitung secara otomatis nilai <b>Is (pickup), TMS, dan Iinst</b> berdasarkan: (1) parameter GI dari Database, (2) parameter operasional (I_beban, NGR), (3) koefisien dari Standard Rules.</div>
    <div class="man-h3">Parameter Sistem yang Dihitung Otomatis</div>
    <table class="man-tbl">
      <thead><tr><th>Parameter</th><th>Formula</th><th>Satuan</th></tr></thead>
      <tbody>
        <tr><td>In 20kV</td><td class="man-code">MVA × 1000 / (√3 × 20)</td><td>Ampere</td></tr>
        <tr><td>In 150kV</td><td class="man-code">MVA × 1000 / (√3 × 150)</td><td>Ampere</td></tr>
        <tr><td>IHS_trafo (3Φ)</td><td class="man-code">In / (Xt/100)</td><td>Ampere</td></tr>
        <tr><td>IHS_trafo_PhN</td><td class="man-code">IHS_trafo / 7.5</td><td>Ampere</td></tr>
        <tr><td>IHS 20kV sistem</td><td class="man-code">(20/√3) / (Xt_trafo_Ω + Z_150_ref)</td><td>kA→Ampere</td></tr>
        <tr><td>I_NGR</td><td class="man-code">20000 / (√3 × R_NGR)</td><td>Ampere</td></tr>
      </tbody>
    </table>
    <div class="man-h3">Formula TMS Langsung</div>
    <div class="man-tip">💡 <b>IEC SI (Standard Inverse):</b> <span class="man-code">TMS = t_target × (M^0.02 − 1) / 0.14</span></div>
    <div class="man-tip">💡 <b>IEC VI (Very Inverse):</b> <span class="man-code">TMS = t_target × (M − 1) / 13.5</span></div>
    <div class="man-tip">💡 <b>IEC EI (Extremely Inverse):</b> <span class="man-code">TMS = t_target × (M² − 1) / 80</span></div>
    <div class="man-tip">💡 <b>IEC LTI (Long Time Inverse, untuk SBEF):</b> <span class="man-code">TMS = t_target × (M − 1) / 120</span></div>
    <div class="man-tip">📐 <b>Umum:</b> <span class="man-code">M = t_ref_mult × t_ref / Iset</span> — <code>t_ref_mult</code> adalah koefisien koordinasi (default 1.0).</div>
    <div class="man-tip">🔵 <b>OCR Outgoing (kesepakatan PLN, IEC-SI):</b> <span class="man-code">TMS = t_target × (((0,2 × t_ref / Iset)^0,02) − 1) / 0,14</span> — set <code>t_ref_mult = 0.2</code>.</div>
    <div class="man-p">Dimana <b>M = I_ref / Is</b> (Plug Setting Multiplier). Formula di atas adalah inversi dari formula waktu trip IEC 60255.</div>
  </div>

  <!-- SETTING RELE — MODE -->
  <div class="man-section">
    <div class="man-h2">Tab #3 — Setting Rele (Manual vs Import)</div>
    <div class="man-p">Tab <b>Setting Rele</b> memiliki <b>10 slot rele</b>. Dua mode operasi di bagian atas tab:</div>
    <table class="man-tbl">
      <thead><tr><th>Mode</th><th>Behavior</th><th>Kapan Digunakan</th></tr></thead>
      <tbody>
        <tr><td><b>✏️ Manual</b></td><td>Semua field input bebas, data tersimpan per rele</td><td>Input custom, benchmark setting existing, eksperimen "what-if"</td></tr>
        <tr><td><b>🔗 Import</b></td><td>Field dikunci, data mengikuti hasil Setting Engine</td><td>Setelah klik "Terapkan Setting Rele" di Engine, menjamin konsistensi</td></tr>
      </tbody>
    </table>
    <div class="man-h3">3 Stage per Rele (OCR &amp; GFR)</div>
    <table class="man-tbl">
      <thead><tr><th>Stage</th><th>Parameter</th><th>Keterangan</th></tr></thead>
      <tbody>
        <tr><td><b>Stage 1 — TOC Inverse</b></td><td>Is, TMS, Karakteristik (IEC/ANSI)</td><td>Kurva invers waktu-arus</td></tr>
        <tr><td><b>Stage 2 — Instant (I&gt;&gt;)</b></td><td>Iinst, TD&gt;&gt;</td><td>Nilai 0 = OFF. TD&gt;&gt; biasanya 0.1–0.6 s</td></tr>
        <tr><td><b>Stage 3 — High Inst (I&gt;&gt;&gt;)</b></td><td>Iinst2, TD&gt;&gt;&gt;</td><td>Nilai 0 = OFF. Jika aktif → <b>reclose dilarang</b></td></tr>
      </tbody>
    </table>
    <div class="man-h3">Karakteristik Kurva yang Tersedia</div>
    <table class="man-tbl">
      <thead><tr><th>Kode</th><th>Nama</th><th>Formula: t = TMS × [...]</th><th>Penggunaan</th></tr></thead>
      <tbody>
        <tr><td><span class="man-code">C_SI</span></td><td>IEC SI</td><td>0.14 / (M^0.02 − 1)</td><td>OCR &amp; GFR standar PLN</td></tr>
        <tr><td><span class="man-code">C_VI</span></td><td>IEC VI</td><td>13.5 / (M − 1)</td><td>Selektivitas tinggi</td></tr>
        <tr><td><span class="man-code">C_EI</span></td><td>IEC EI</td><td>80 / (M² − 1)</td><td>Beban non-linier</td></tr>
        <tr><td><span class="man-code">C_LTI</span></td><td>IEC LTI</td><td>120 / (M − 1)</td><td>SBEF (waktu trip panjang)</td></tr>
        <tr><td><span class="man-code">DT</span></td><td>Definite Time</td><td>t = TMS (konstan)</td><td>Selektivitas waktu tetap</td></tr>
      </tbody>
    </table>
    <div class="man-note">⚠️ <b>NGR PLN:</b> Resistansi default 40Ω → I_NGR ≈ 288.67 A. Ketahanan termal NGR = 300A / 10 detik. Pastikan t_SBEF @ I_NGR ≤ 10 s (V-06).</div>
  </div>

  <!-- KURVA ANALISA -->
  <div class="man-section">
    <div class="man-h2">Tab #4 — Kurva &amp; Analisa TCC</div>
    <div class="man-p">Visualisasi <b>Time-Current Characteristic (TCC)</b> dengan sumbu log-log. Chart OCR dan GFR dipisah. Sumber data: <b>Setting Rele</b> (bukan Setting Engine).</div>
    <div class="man-h3">Kontrol Chart</div>
    <div class="man-step"><b>I min / I maks:</b> atur range sumbu X untuk zoom in/out.</div>
    <div class="man-step"><b>t maks:</b> atur maksimum sumbu Y waktu trip.</div>
    <div class="man-step"><b>Overlay:</b> Trafo (kurva ketahanan trafo 80%/100% damage), Inrush (kurva starting transformer), NGR (batas ketahanan NGR), Marker (titik arus gangguan).</div>
    <div class="man-h3">Tabel Analisa Waktu Trip</div>
    <div class="man-p">Di bawah chart terdapat tabel dengan <b>titik arus gangguan</b> yang dapat ditambah manual. Setiap titik dihitung terhadap semua rele aktif untuk melihat <b>waktu trip aktual</b>.</div>
    <div class="man-tip">💡 Tag hasil: <span class="man-code">TOC</span> = Stage 1 invers · <span class="man-code">I&gt;&gt;</span> = Stage 2 · <span class="man-code">I&gt;&gt;&gt;</span> = Stage 3 · <span class="man-code">DT</span> = Definite Time · <span style="color:#94a3b8">— &lt; I&gt;</span> = di bawah pickup.</div>
  </div>

  <!-- DUAL VALIDATOR -->
  <div class="man-section">
    <div class="man-h2">Tab #5 — Dual Coordination Validator</div>
    <div class="man-p">Validator v8 menjalankan validasi pada <b>2 dataset secara paralel</b>: (A) Setting Rele (nilai aktual di rele), (B) Setting Engine (nilai hasil kalkulasi). Perbedaan hasil = indikasi drift antara setting terpasang dan rekomendasi terbaru.</div>
    <div class="man-h3">6 Rules Validasi</div>
    <table class="man-tbl">
      <thead><tr><th>Rule</th><th>Kriteria</th><th>PASS</th><th>WARN</th><th>FAIL</th></tr></thead>
      <tbody>
        <tr><td><b>V-01</b></td><td>Δt trip US–DS pada I_inst_DS</td><td>≥ 0.30 s</td><td>0.25–0.30 s</td><td>&lt; 0.25 s</td></tr>
        <tr><td><b>V-02</b></td><td>Is_US / Is_DS</td><td>≥ 1.2</td><td>1.1–1.2</td><td>&lt; 1.1</td></tr>
        <tr><td><b>V-03</b></td><td>Iinst2_DS &lt; 0.8 × Iinst2_US</td><td>Tidak overlap</td><td>—</td><td>Overlap</td></tr>
        <tr><td><b>V-04</b></td><td>Stage 3 (I&gt;&gt;&gt;) aktif</td><td colspan="3">INFO — Reclose DILARANG jika I&gt;&gt;&gt; aktif</td></tr>
        <tr><td><b>V-05</b></td><td>GFR INCOMING vs SBEF-1 @ I_NGR</td><td>Δt ≥ 0.30 s</td><td>0.25–0.30 s</td><td>&lt; 0.25 s</td></tr>
        <tr><td><b>V-06</b></td><td>t_SBEF-1 @ I_NGR</td><td>≤ 10 s</td><td>10–12 s</td><td>&gt; 12 s</td></tr>
      </tbody>
    </table>
    <div class="man-h3">Hitung Rekomendasi Perbaikan</div>
    <div class="man-p">Tombol <b>🔧 Hitung Rekomendasi Perbaikan</b> akan menghitung TMS baru untuk rele upstream yang gagal V-01 / V-05. Hasilnya <b>HANYA REKOMENDASI</b> — tidak mengubah Setting Rele. Engineer memutuskan apakah:</div>
    <div style="padding:6px 10px;background:#eff6ff;border-radius:5px;font-size:.65rem;line-height:1.7">
      <b>Opsi A:</b> Menerapkan rekomendasi manual ke rele (set mode Manual, input nilai baru).<br>
      <b>Opsi B:</b> Menyesuaikan Standard Rules (ubah t_target) → rerun Engine → Apply.<br>
      <b>Opsi C:</b> Menolak rekomendasi bila tidak praktis di lapangan (dokumentasikan alasannya di BA).
    </div>
  </div>

  <!-- TFC -->
  <div class="man-section">
    <div class="man-h2">Tab #6 — TFC Health Monitor (IEEE C57.109)</div>
    <div class="man-p">Memantau akumulasi kerusakan termal trafo akibat arus gangguan menggunakan formula <b>ISQT (I²·t method)</b>:</div>
    <div style="text-align:center;padding:6px;background:#fffbeb;border-radius:6px;margin:6px 0">
      <span class="man-code" style="font-size:.78rem">D_event = (I / In)² × t / k</span>
    </div>
    <table class="man-tbl">
      <thead><tr><th>Rating Trafo</th><th>k (konstanta)</th><th>In 20kV (A)</th><th>Batas t @ 8×In</th></tr></thead>
      <tbody>
        <tr><td>60 MVA</td><td>384</td><td>1732</td><td>6.0 s</td></tr>
        <tr><td>30 MVA</td><td>96</td><td>866</td><td>1.5 s</td></tr>
        <tr><td>20 MVA</td><td>42.67</td><td>577</td><td>0.67 s</td></tr>
      </tbody>
    </table>
    <table class="man-tbl">
      <thead><tr><th>D Kumulatif</th><th>Status</th><th>Rekomendasi Tindakan</th></tr></thead>
      <tbody>
        <tr><td>&lt; 50%</td><td>🟢 AMAN</td><td>Operasi normal</td></tr>
        <tr><td>50%–80%</td><td>🟡 PERHATIAN</td><td>Jadwalkan pemeriksaan isolasi, uji tan δ, DGA</td></tr>
        <tr><td>&gt; 80%</td><td>🔴 KRITIS</td><td>Segera cek isolasi, pertimbangkan penggantian core</td></tr>
      </tbody>
    </table>
  </div>

  <!-- TMS CALC -->
  <div class="man-section">
    <div class="man-h2">Tab #7 — Kalkulator TMS</div>
    <div class="man-p">Kalkulator cepat untuk dua skenario:</div>
    <div class="man-step"><b>Hitung TMS dari Waktu Target:</b> input arus gangguan, Is pickup, karakteristik, waktu target → dapatkan TMS.</div>
    <div class="man-step"><b>Hitung Waktu Trip dari TMS:</b> input arus, Is, karakteristik, TMS → dapatkan waktu trip aktual.</div>
    <div class="man-tip">💡 Cocok untuk verifikasi cepat atau "what-if" tanpa mengutak-atik Setting Engine.</div>
  </div>

  <!-- REPORT BA -->
  <div class="man-section">
    <div class="man-h2">Tab #8 — Laporan BA (Checklist Fleksibel)</div>
    <div class="man-p">Generator Berita Acara v8 memakai <b>checklist konten</b>. Centang bagian yang diperlukan, urutan cetak mengikuti hirarki checklist:</div>
    <table class="man-tbl">
      <thead><tr><th>Urutan</th><th>Konten</th><th>Sumber Data</th></tr></thead>
      <tbody>
        <tr><td><b>I</b></td><td>Setting Engine</td><td>engResults (harus dihitung dulu)</td></tr>
        <tr><td><b>II</b></td><td>Setting Rele</td><td>Tab Setting Rele (semua 10 slot aktif)</td></tr>
        <tr><td><b>III</b></td><td>Kurva &amp; Analisa</td><td>Canvas chart + tabel waktu trip</td></tr>
        <tr><td><b>IV</b></td><td>Validator (Dual)</td><td>Matriks Setting Rele + Setting Engine</td></tr>
        <tr><td><b>V</b></td><td>TFC Monitor</td><td>D kumulatif, event historis</td></tr>
      </tbody>
    </table>
    <div class="man-tip">💡 Semua section yang tidak dicentang akan di-skip dari hasil cetak. Tombol <b>✓ Centang Semua</b> / <b>☐ Kosongkan</b> untuk toggle cepat.</div>
  </div>

  <!-- DATABASE GI -->
  <div class="man-section">
    <div class="man-h2">Tab #9 — Database GI</div>
    <div class="man-p">Database gardu induk Kalimantan dengan 166+ entri. Setiap entri berisi:</div>
    <table class="man-tbl">
      <thead><tr><th>Kolom</th><th>Tipe</th><th>Keterangan</th></tr></thead>
      <tbody>
        <tr><td>Nama GI / Trafo</td><td>Text</td><td>Identifier unik (contoh: GI_TRISAKTI_150_KV_TD_5)</td></tr>
        <tr><td>Wilayah</td><td>Enum</td><td>KALBAR · KALSELTENG · KALTIMRA</td></tr>
        <tr><td>IHS 150kV</td><td>kA</td><td>Short circuit capacity primer</td></tr>
        <tr><td>Rating</td><td>MVA</td><td>Kapasitas trafo</td></tr>
        <tr><td>Xt</td><td>%</td><td>Impedansi trafo pada base sendiri</td></tr>
        <tr><td>KHA Couple</td><td>A</td><td>Kapasitas hantar arus Coupler 20kV</td></tr>
        <tr><td>I_beban</td><td>A</td><td>Beban operasional maks penyulang (default/template)</td></tr>
        <tr><td>NGR</td><td>Ω</td><td>Resistansi NGR (default 40Ω)</td></tr>
        <tr style="background:#f0fdf4"><td>In (A) ⚡</td><td>Auto</td><td>Dihitung otomatis dari MVA &amp; tegangan</td></tr>
        <tr style="background:#f0fdf4"><td>IHS Trafo ⚡</td><td>Auto</td><td>Dihitung otomatis dari In &amp; Xt</td></tr>
        <tr style="background:#f0fdf4"><td>I_NGR ⚡</td><td>Auto</td><td>Dihitung otomatis dari V &amp; R_NGR</td></tr>
      </tbody>
    </table>
    <div class="man-tip">💡 <b>Filter wilayah</b>: dropdown Kalbar/Kalselteng/Kaltimra untuk mempercepat pencarian.</div>
    <div class="man-note">⚠️ Database tersimpan di browser (localStorage). Lakukan <b>Export JSON</b> berkala untuk backup.</div>
  </div>

  <!-- SIMPAN/LOAD -->
  <div class="man-section">
    <div class="man-h2">Simpan &amp; Load Konfigurasi</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:.65rem">
      <div class="man-step"><b>Simpan Setting Rele:</b> Tab Setting Rele → <b>Simpan Config</b> → file JSON</div>
      <div class="man-step"><b>Load Setting Rele:</b> Tab Setting Rele → <b>Load Config</b> → pilih file JSON</div>
      <div class="man-step"><b>Export Standard Rules:</b> Tab Standard Rules → <b>⬇ Export Rules</b></div>
      <div class="man-step"><b>Export Database GI:</b> Tab Database GI → <b>⬇ Export JSON</b></div>
      <div class="man-step"><b>Print Kurva:</b> Tab Kurva → tombol <b>Print</b></div>
      <div class="man-step"><b>Berita Acara:</b> Tab Laporan BA → centang konten → <b>Buat &amp; Print</b></div>
    </div>
  </div>

  <!-- TROUBLESHOOTING -->
  <div class="man-section" style="border-left-color:#dc2626">
    <div class="man-h2" style="color:#dc2626;border-color:#dc2626">Troubleshooting</div>
    <table class="man-tbl">
      <thead><tr><th>Gejala</th><th>Penyebab</th><th>Solusi</th></tr></thead>
      <tbody>
        <tr><td>Database GI kosong</td><td>localStorage corrupt atau dihapus</td><td>Klik <b>↺ Reset Default</b> atau Import JSON backup</td></tr>
        <tr><td>Setting Engine tidak menghitung</td><td>GI belum dipilih dari Database</td><td>Kembali ke Database GI → pilih → Load</td></tr>
        <tr><td>Validator hasil NA semua</td><td>Rele upstream/downstream tidak aktif</td><td>Aktifkan toggle OCR/GFR di Setting Rele</td></tr>
        <tr><td>Kurva tidak muncul</td><td>Is &gt; I_maks chart atau rele OFF</td><td>Cek range I min/maks dan toggle rele</td></tr>
        <tr><td>Field Setting Rele tidak bisa diedit</td><td>Mode sedang Import</td><td>Ganti mode ke <b>✏️ Manual</b> di toggle atas</td></tr>
        <tr><td>BA kosong saat print</td><td>Semua checklist tidak dicentang</td><td>Centang minimal satu konten sebelum Print</td></tr>
      </tbody>
    </table>
  </div>

  <!-- FOOTER INFO -->
  <div class="man-section" style="border-left-color:#94a3b8">
    <div style="font-size:.65rem;color:var(--muted);line-height:1.8">
      <b>SIMCOR v8.0</b> | Referensi: Kesepakatan Bersama UID Kalbar/Kalselteng/Kaltimra · IEC 60255 · IEEE C37.112 · IEEE C57.109<br>
      <b>Perubahan v8:</b> Tab <b>Standard Rules</b> baru (basis formula Engine) · Setting Rele mode Manual / Import · <b>Dual Validator</b> (Rele + Engine side-by-side) · Laporan BA <b>checklist fleksibel</b> · Database GI lengkap dengan kolom derived &amp; operasional · Manual penggunaan terisi lengkap.<br>
      <b>Dibuat untuk:</b> Engineer Proteksi PLN UID Kalbar / Kalselteng / Kaltimra
    </div>
  </div>

  <!-- ALUR KERJA -->
  <div class="man-section">
    <div class="man-h2">Alur Kerja yang Disarankan</div>
    <div class="man-step"><b>① Pilih GI dari Database</b> → Tab <i>Database GI</i> → cari nama GI → klik <b>→ Load ke Engine</b></div>
    <div class="man-step"><b>② Jalankan Setting Engine</b> → Tab <i>Setting Engine</i> → isi beban penyulang → klik <b>🔄 Hitung Otomatis</b> → lihat tabel nilai primer</div>
    <div class="man-step"><b>③ Terapkan ke Setting Rele</b> → klik <b>✔ Terapkan ke Setting Rele</b> → semua slot rele terisi otomatis</div>
    <div class="man-step"><b>④ Review Kurva TCC</b> → Tab <i>Kurva &amp; Analisa</i> → verifikasi visual koordinasi kurva log-log</div>
    <div class="man-step"><b>⑤ Validasi Koordinasi</b> → Tab <i>Validator</i> → klik <b>▶ Jalankan Validasi</b> → jika ada FAIL → klik <b>🔧 Hitung Perbaikan Otomatis</b></div>
    <div class="man-step"><b>⑥ Monitor TFC Trafo</b> → Tab <i>TFC Monitor</i> → input event gangguan → pantau akumulasi kerusakan termal</div>
    <div class="man-step"><b>⑦ Generate Berita Acara</b> → Tab <i>Laporan BA</i> → isi nomor BA → klik <b>📄 Buat &amp; Print</b></div>
  </div>

  <!-- SETTING ENGINE -->
  <div class="man-section">
    <div class="man-h2">Setting Engine — Formula Kalkulasi</div>
    <div class="man-p">Setting Engine menghitung secara otomatis nilai <b>Is (pickup), TMS, dan Iinst</b> untuk semua rele berdasarkan formula <b>Kesepakatan Bersama UID Kalbar/Kalselteng/Kaltimra</b>.</div>
    <div class="man-h3">Parameter yang Dihitung Otomatis dari Database GI</div>
    <table class="man-tbl">
      <thead><tr><th>Parameter</th><th>Formula</th><th>Keterangan</th></tr></thead>
      <tbody>
        <tr><td>In 20kV</td><td class="man-code">MVA × 1000 / (√3 × 20)</td><td>Arus nominal trafo sisi LV</td></tr>
        <tr><td>IHS_trafo (3Φ)</td><td class="man-code">In / (Xt/100)</td><td>Arus hubung singkat internal trafo</td></tr>
        <tr><td>IHS_trafo_PhN</td><td class="man-code">IHS_trafo / 7.5</td><td>IHS fasa-netral sisi trafo</td></tr>
        <tr><td>IHS_sistem 20kV</td><td class="man-code">(20kV/√3) / (Xt_trafo_Ω + Z_150kV_ref)</td><td>Termasuk impedansi upstream 150kV</td></tr>
        <tr><td>I_NGR</td><td class="man-code">20000 / (√3 × 40) = 288.67 A</td><td>Arus gangguan tanah melalui NGR 40Ω</td></tr>
      </tbody>
    </table>
    <div class="man-h3">Rekomendasi Setting per Fungsi Rele</div>
    <div style="overflow-x:auto">
    <table class="man-tbl">
      <thead><tr><th>Rele</th><th>Fungsi</th><th>Is / Io> (A)</th><th>I_referensi TMS</th><th>t target (s)</th><th>Iinst (A)</th><th>TD (s)</th></tr></thead>
      <tbody>
        <tr><td><b>BPU HV</b></td><td>150kV OCR</td><td>1.2 × In_150kV</td><td>IHS_trafo_PhN</td><td>1.3</td><td>0.52 × IHS_trafo_PhN</td><td>0.9</td></tr>
        <tr><td><b>INCOMING</b></td><td>20kV OCR</td><td>1.2 × In_20kV</td><td>IHS_trafo</td><td>1.0</td><td>0.5 × IHS_trafo</td><td>0.6</td></tr>
        <tr><td><b>INCOMING</b></td><td>GFR</td><td>0.125 × I_NGR ≈ 36A</td><td>I_NGR</td><td>1.4</td><td>—</td><td>—</td></tr>
        <tr><td><b>COUPLER</b></td><td>OCR</td><td>min(1.2×KHA, 1.2×In)</td><td>IHS_trafo</td><td>0.7</td><td>0.45 × IHS_trafo</td><td>0.3</td></tr>
        <tr><td><b>COUPLER</b></td><td>GFR</td><td>0.125 × I_NGR ≈ 36A</td><td>I_NGR</td><td>1.1</td><td>—</td><td>—</td></tr>
        <tr><td><b>OUTGOING</b></td><td>OCR</td><td>1.2 × I_beban</td><td>0.4 × IHS_trafo</td><td>1.0</td><td>Stg2: 0.4×IHS_sys</td><td>0.2</td></tr>
        <tr><td><b>OUTGOING</b></td><td>GFR</td><td>0.104 × I_NGR ≈ 30A</td><td>I_NGR</td><td>0.9</td><td>Io>>: 1.0×I_NGR</td><td>0.3</td></tr>
        <tr><td><b>SBEF-1</b></td><td>GFR (LTI)</td><td>0.125 × I_NGR ≈ 36A</td><td>I_NGR</td><td>5.0 s</td><td>—</td><td>—</td></tr>
        <tr><td><b>SBEF-2</b></td><td>GFR (LTI)</td><td>0.125 × I_NGR ≈ 36A</td><td>I_NGR</td><td>5.5 s</td><td>—</td><td>—</td></tr>
      </tbody>
    </table>
    </div>
    <div class="man-tip">💡 <b>Rumus TMS langsung (IEC SI):</b> <span class="man-code">TMS = t_target × (M^0.02 − 1) / 0.14</span> &nbsp;dengan <b>M = t_ref_mult × t_ref / Iset</b></div>
    <div class="man-tip">🔵 <b>Rumus khusus OCR Outgoing:</b> <span class="man-code">TMS = t_target × (((0,2 × t_ref / Iset)^0,02) − 1) / 0,14</span> &nbsp;(t_ref_mult=0.2)</div>
    <div class="man-tip">💡 <b>Rumus TMS SBEF (IEC LTI):</b> <span class="man-code">TMS = t_target × (M − 1) / 120</span> &nbsp;M=8 → TMS₁=0.2917, TMS₂=0.3208</div>
    <div class="man-note">⚠️ Iinst Outgoing Stage-3 (0.5×IHS_trafo) tidak boleh direclose. Pastikan rele Outgoing dikonfigurasi tanpa reclose jika Stage-3 aktif (V-04).</div>
  </div>

  <!-- SETTING RELE MANUAL -->
  <div class="man-section">
    <div class="man-h2">Input Setting Rele Manual</div>
    <div class="man-p">Tab <b>Setting Rele</b> memiliki 10 slot rele. Setiap rele dapat dikonfigurasi sebagai OCR dan/atau GFR secara independen dengan 3 stage:</div>
    <table class="man-tbl">
      <thead><tr><th>Stage</th><th>Nama</th><th>Parameter</th><th>Keterangan</th></tr></thead>
      <tbody>
        <tr><td><b>Stage 1</b></td><td>TOC Inverse</td><td>Is (A primer), TMS, Karakteristik</td><td>Kurva invers waktu-arus. Nilai 0 tidak menonaktifkan.</td></tr>
        <tr><td><b>Stage 2</b></td><td>Instantaneous (I>>)</td><td>Iinst (A primer), TD>> (s)</td><td>Nilai 0 = OFF. TD>> biasanya 0.1–0.6 s.</td></tr>
        <tr><td><b>Stage 3</b></td><td>High Inst (I>>>)</td><td>Iinst2 (A primer), TD>>> (s)</td><td>Nilai 0 = OFF. Jika aktif → <b>reclose dilarang</b>.</td></tr>
      </tbody>
    </table>
    <div class="man-h3">Karakteristik Kurva yang Tersedia</div>
    <table class="man-tbl">
      <thead><tr><th>Kode</th><th>Nama</th><th>Formula: t = TMS × [...]</th><th>Penggunaan</th></tr></thead>
      <tbody>
        <tr><td><span class="man-code">C_SI</span></td><td>IEC SI</td><td>0.14 / (M^0.02 − 1)</td><td>OCR &amp; GFR standar PLN</td></tr>
        <tr><td><span class="man-code">C_VI</span></td><td>IEC VI</td><td>13.5 / (M − 1)</td><td>Selektivitas tinggi</td></tr>
        <tr><td><span class="man-code">C_EI</span></td><td>IEC EI</td><td>80 / (M² − 1)</td><td>Beban non-linier</td></tr>
        <tr><td><span class="man-code">C_LTI</span></td><td>IEC LTI</td><td>120 / (M − 1)</td><td>SBEF (waktu trip panjang)</td></tr>
        <tr><td><span class="man-code">DT</span></td><td>Definite Time</td><td>t = TMS (konstan)</td><td>Selektivitas waktu tetap</td></tr>
      </tbody>
    </table>
    <div class="man-note">⚠️ <b>NGR PLN:</b> Resistansi 40Ω → I_NGR = 288.67A. Ketahanan termal NGR = 300A / 10 detik. Pastikan t_SBEF @ I_NGR ≤ 10 s.</div>
  </div>

  <!-- VALIDATOR -->
  <div class="man-section">
    <div class="man-h2">Koordinasi Validator — 6 Rules</div>
    <table class="man-tbl">
      <thead><tr><th>Rule</th><th>Kriteria</th><th>PASS</th><th>WARN</th><th>FAIL</th></tr></thead>
      <tbody>
        <tr><td><b>V-01</b></td><td>Δt trip US–DS pada I_inst_DS</td><td>≥ 0.30 s</td><td>0.25–0.30 s</td><td>&lt; 0.25 s</td></tr>
        <tr><td><b>V-02</b></td><td>Is_US / Is_DS</td><td>≥ 1.2</td><td>1.1–1.2</td><td>&lt; 1.1</td></tr>
        <tr><td><b>V-03</b></td><td>Iinst2_DS &lt; 0.8 × Iinst2_US</td><td>Tidak overlap</td><td>—</td><td>Overlap</td></tr>
        <tr><td><b>V-04</b></td><td>Stage 3 (I>>>) aktif</td><td colspan="3">INFO — Reclose DILARANG jika I>>> aktif</td></tr>
        <tr><td><b>V-05</b></td><td>GFR INCOMING vs SBEF-1 @ I_NGR</td><td>Δt ≥ 0.30 s</td><td>0.25–0.30 s</td><td>&lt; 0.25 s</td></tr>
        <tr><td><b>V-06</b></td><td>t_SBEF-1 @ I_NGR</td><td>≤ 10 s</td><td>10–12 s</td><td>&gt; 12 s</td></tr>
      </tbody>
    </table>
    <div class="man-tip">💡 Klik <b>🔧 Hitung Perbaikan Otomatis</b> — otomatis menghitung TMS baru untuk rele upstream yang gagal V-01 atau V-05, kemudian diterapkan langsung ke setting.</div>
  </div>

  <!-- TFC -->
  <div class="man-section">
    <div class="man-h2">TFC Health Monitor — IEEE C57.109</div>
    <div class="man-p">Memantau akumulasi kerusakan termal trafo akibat arus gangguan menggunakan formula <b>ISQT (I²·t method)</b>:</div>
    <div style="text-align:center;padding:6px;background:#fffbeb;border-radius:6px;margin:6px 0">
      <span class="man-code" style="font-size:.75rem">D_event = (I / In)² × t / k</span>
    </div>
    <table class="man-tbl">
      <thead><tr><th>Rating Trafo</th><th>k (konstanta)</th><th>In 20kV (A)</th><th>Batas t @ 8×In</th></tr></thead>
      <tbody>
        <tr><td>60 MVA</td><td>384</td><td>1732</td><td>6.0 s</td></tr>
        <tr><td>30 MVA</td><td>96</td><td>866</td><td>1.5 s</td></tr>
        <tr><td>20 MVA</td><td>42.67</td><td>577</td><td>0.67 s</td></tr>
      </tbody>
    </table>
    <table class="man-tbl">
      <thead><tr><th>D Kumulatif</th><th>Status</th><th>Rekomendasi Tindakan</th></tr></thead>
      <tbody>
        <tr><td>&lt; 50%</td><td>🟢 AMAN</td><td>Operasi normal</td></tr>
        <tr><td>50%–80%</td><td>🟡 PERHATIAN</td><td>Jadwalkan pemeriksaan isolasi, uji tan δ</td></tr>
        <tr><td>&gt; 80%</td><td>🔴 KRITIS</td><td>Segera cek isolasi, pertimbangkan penggantian</td></tr>
      </tbody>
    </table>
  </div>

  <!-- SIMPAN/LOAD -->
  <div class="man-section">
    <div class="man-h2">Simpan &amp; Load Konfigurasi</div>
    <div class="man-p">Semua setting rele (Is, TMS, Iinst, CT ratio, kurva) dapat disimpan ke file <b>.json</b> dan di-load kembali kapan saja:</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:.66rem">
      <div class="man-step"><b>Simpan:</b> Tab Setting Rele → tombol <b>Simpan Config</b> → file JSON terunduh</div>
      <div class="man-step"><b>Load:</b> Tab Setting Rele → tombol <b>Load Config</b> → pilih file JSON</div>
      <div class="man-step"><b>Print Kurva:</b> Tab Kurva → tombol <b>Print</b> → buka halaman print</div>
      <div class="man-step"><b>Berita Acara:</b> Tab Laporan BA → isi identitas → <b>Buat &amp; Print</b></div>
    </div>
    <div class="man-note">⚠️ Database GI tersimpan otomatis di browser (localStorage). Gunakan Export JSON untuk backup ke file agar tidak hilang saat cache browser dibersihkan.</div>
  </div>

  <!-- FOOTER INFO -->
  <div class="man-section" style="border-left-color:#94a3b8">
    <div style="font-size:.65rem;color:var(--muted);line-height:1.8">
      <b>SIMCOR v7.0</b> | Referensi: Kesepakatan Bersama UID Kalbar/Kalselteng/Kaltimra · IEC 60255 · IEEE C37.112 · IEEE C57.109<br>
      <b>Perubahan v7:</b> Formula Setting Engine dikoreksi sesuai referensi "set generator.xlsx" · Tambah Database GI 166 entri · IHS 150kV sebagai input sistem · TMS formula langsung (tanpa binary search) · Auto-Fix Validator diperbaiki<br>
      <b>Dibuat untuk:</b> Engineer Proteksi PLN UID Kalbar / Kalselteng / Kaltimra
    </div>
  </div>

</div>
</div>

