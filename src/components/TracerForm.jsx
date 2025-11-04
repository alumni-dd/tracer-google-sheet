import React, { useState } from 'react';

// Import semua komponen MUI yang Anda gunakan
import {
  Box, Stepper, Step, StepLabel, Button, Typography,
  TextField, Grid, Paper, Snackbar, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, Divider, List, ListItem, ListItemText,
  FormControlLabel, Checkbox, Autocomplete, Radio, RadioGroup, FormLabel, FormControl, Rating,
  CircularProgress
} from '@mui/material';

// Import logika API kita
import { runServer } from '../utils/api';

// --- KONFIGURASI FORM (disalin langsung dari index.html) ---
const stepsConfig = [
  {
    title: 'Data Diri',
    fields: [
      { name:'programBeasiswa', label:'Program Beasiswa DD', type:'select', required:true, options:[{v:'BAKTI NUSA',t:'BAKTI NUSA'},{v:'Etos ID',t:'Etos ID'},{v:'YES',t:'YES'}] },
      { name:'angkatanProgram', label:'Angkatan Program DD', type:'select', required:true, optionsMap: {
          'BAKTI NUSA': Array.from({length:14}, (_,i)=>({ v:String(i+1), t:String(i+1) })),
          'Etos ID': Array.from({length:(2021-2003+1)}, (_,i)=>({ v:String(2003+i), t:String(2003+i) })),
          'YES': [{v:'1',t:'1'},{v:'2',t:'2'},{v:'3',t:'3'}]
        }, dependsOn:{ stepIndex:0, fieldName:'programBeasiswa' } },
      { name:'namaLengkap', label:'Nama Lengkap', type:'text', required:true },
      { name:'jenisKelamin', label:'Jenis Kelamin', type:'select', required:true, options:[{v:'Laki-laki',t:'Laki-laki'},{v:'Perempuan',t:'Perempuan'}] },
      { name:'nomorWA', label:'Nomor WA', type:'number', required:true },
      { name:'alamatGmail', label:'Alamat Gmail', type:'gmail', required:true },
      { name:'domisili', label:'Domisili saat ini', type:'select', options:[{v:'Dalam Negeri',t:'Dalam Negeri'},{v:'Luar Negeri',t:'Luar Negeri'}], required:true },
      { name:'provinsi', label:'Provinsi', type:'autocomplete', fetch:'getProvinces', showIf:{ fieldName:'domisili', value:'Dalam Negeri' } },
      { name:'kabkota', label:'Kabupaten / Kota', type:'autocomplete', fetch:'getRegencies', fetchDependsOn:{ stepIndex:0, fieldName:'provinsi' }, showIf:{ fieldName:'domisili', value:'Dalam Negeri' } },
      { name:'negara', label:'Negara', type:'autocomplete', fetch:'getCountries', showIf:{ fieldName:'domisili', value:'Luar Negeri' } }
    ]
  },
  {
    title: 'Status Pasca Lulus Program',
    fields: [
      { name: 'klasterProfesi', label: 'Klaster profesi Anda saat ini?', type: 'select', required: true, options: [
          { v: 'Profesional', t: 'Profesional' },{ v: 'Akademisi', t: 'Akademisi' },{ v: 'Wiraswasta', t: 'Wiraswasta' },{ v: 'Melanjutkan Pendidikan', t: 'Melanjutkan Pendidikan' },{ v: 'Sedang Mencari Pekerjaan', t: 'Sedang Mencari Pekerjaan' },{ v: 'Tidak Bekerja & Tidak Mencari Pekerjaan', t: 'Tidak Bekerja & Tidak Mencari Pekerjaan' },{ v: 'Full Mom', t: 'Full Mom' }
        ] },
      { name: 'namaPerusahaan', label: 'Nama Perusahaan tempat anda bekerja?', type: 'text', required: true, showIf: { fieldName: 'klasterProfesi', value: 'Profesional' } },
      { name: 'sektorProfesional', label: 'Sektor Perusahaan', type: 'select', required: true, options: [{ v: 'ASN', t: 'ASN' },{ v: 'BUMN', t: 'BUMN' },{ v: 'NGO', t: 'NGO' },{ v: 'Swasta', t: 'Swasta' },{ v: 'Multinasional', t: 'Multinasional' },{ v: 'Lainnya', t: 'Lainnya' }], showIf: { fieldName: 'klasterProfesi', value: 'Profesional' } },
      { name: 'jabatanProfesional', label: 'Jabatan/Posisi saat ini', type: 'text', required: true, showIf: { fieldName: 'klasterProfesi', value: 'Profesional' } },
      { name: 'namaUsaha', label: 'Nama Usaha/Bisnis yang anda bangun?', type: 'text', required: true, showIf: { fieldName: 'klasterProfesi', value: 'Wiraswasta' } },
      { name: 'sektorUsaha', label: 'Sektor Usaha', type: 'select', required: true, options: [{ v: 'Retail', t: 'Retail' },{ v: 'Industri', t: 'Industri' },{ v: 'Jasa', t: 'Jasa' },{ v: 'Teknologi', t: 'Teknologi' },{ v: 'Pariwisata', t: 'Pariwisata' },{ v: 'Properti', t: 'Properti' },{ v: 'FnB', t: 'FnB' },{ v: 'Fashion', t: 'Fashion' },{ v: 'Lainnya', t: 'Lainnya' }], showIf: { fieldName: 'klasterProfesi', value: 'Wiraswasta' } },
      { name: 'namaInstansi', label: 'Nama Instansi Pendidikan tempat anda bekerja?', type: 'text', required: true, showIf: { fieldName: 'klasterProfesi', value: 'Akademisi' } },
      { name: 'sektorPendidikan', label: 'Sektor Pendidikan', type: 'select', required: true, options: [{ v: 'Pendidikan Tinggi', t: 'Pendidikan Tinggi' },{ v: 'Pendidikan Menengah Atas', t: 'Pendidikan Menengah Atas' },{ v: 'Pendidikan Menengah Pertama', t: 'Pendidikan Menengah Pertama' },{ v: 'Pendidikan Dasar', t: 'Pendidikan Dasar' },{ v: 'Pendidikan Formal', t: 'Pendidikan Formal' },{ v: 'Pendidikan Non Formal', t: 'Pendidikan Non Formal' },{ v: 'Lainnya', t: 'Lainnya' }], showIf: { fieldName: 'klasterProfesi', value: 'Akademisi' } },
      { name: 'jabatanFungsional', label: 'Jabatan fungsional saat ini', type: 'text', required: true, showIf: { fieldName: 'klasterProfesi', value: 'Akademisi' } },
      { name: 'namaKampus', label: 'Nama Kampus', type: 'text', required: true, showIf: { fieldName: 'klasterProfesi', value: 'Melanjutkan Pendidikan' } },
      { name: 'tingkatPendidikan', label: 'Tingkat Pendidikan yang ditempuh?', type: 'select', required: true, options: [{ v: 'D1', t: 'D1' },{ v: 'D2', t: 'D2' },{ v: 'D3', t: 'D3' },{ v: 'D4', t: 'D4' },{ v: 'S1', t: 'S1' },{ v: 'S2', t: 'S2' },{ v: 'S3', t: 'S3' },{ v: 'Lainnya', t: 'Lainnya' }], showIf: { fieldName: 'klasterProfesi', value: 'Melanjutkan Pendidikan' } },
      { name: 'programStudi', label: 'Program Studi', type: 'text', required: true, showIf: { fieldName: 'klasterProfesi', value: 'Melanjutkan Pendidikan' } },
      { name: 'beasiswaPendidikan', label: 'Beasiswa Pendidikan', type: 'text', required: true, showIf: { fieldName: 'klasterProfesi', value: 'Melanjutkan Pendidikan' } },
      { name: 'lainnyaProfesi', label: 'Sebutkan bidang lain', type: 'text', required: true, showIfMulti: [ { fieldName: 'sektorProfesional', value: 'Lainnya' },{ fieldName: 'sektorUsaha', value: 'Lainnya' },{ fieldName: 'sektorPendidikan', value: 'Lainnya' } ] },
      { name: 'alasanBelumKerja', label: 'Alasan', type: 'textarea', showIf: { fieldName: 'klasterProfesi', value: ['Sedang Mencari Pekerjaan', 'Tidak Bekerja & Tidak Mencari Pekerjaan'] } }
    ]
  },
  {
    title:'Preferensi Lain & Submit', fields:[
      { name:'sideHustle', label:'Anda punya side hustle?', type:'select', options:[{v:'Ya',t:'Ya'},{v:'Tidak',t:'Tidak'}], required:true },
      { name:'deskripsiHustle', label:'Deskripsi Side Hustle Anda', type:'textarea', showIf: { fieldName: 'sideHustle', value: 'Ya' } },
      { name:'relevansiProgram', label:'Berikan bintang, seberapa besar pengaruh value program terhadap diri anda hingga saat ini', type:'rating', required:true }
    ]
  }
];
// -----------------------------------------------------

function buildInitialState(config) {
  return config.map(step => {
    const obj = {};
    step.fields.forEach(f => {
      if (f.type === 'checkbox') obj[f.name] = false;
      else if (f.type === 'rating') obj[f.name] = 0;
      else obj[f.name] = '';
    });
    return obj;
  });
}

function buildInitialErrors(config) {
  return config.map(step => {
    const obj = {};
    step.fields.forEach(f => obj[f.name] = '');
    return obj;
  });
}

// --- KOMPONEN DYNAMIC FIELD (dikonversi ke JSX) ---
function DynamicField(props) {
  const { field, value, onChange, error, form } = props;
  const { name, label, type, options, optionsMap, dependsOn, fetch: fetchFn, fetchDependsOn, radioRow } = field;
  const [asyncOptions, setAsyncOptions] = React.useState([]);
  const [loadingOpts, setLoadingOpts] = React.useState(false);

  React.useEffect(() => {
    if (!fetchFn) return;
    let mounted = true;
    let timer = null;

    const load = (depVal) => {
      if (fetchDependsOn && (depVal === null || depVal === undefined || depVal === '')) {
        if (mounted) setAsyncOptions([]);
        return;
      }
      setLoadingOpts(true);
      try {
        if (fetchDependsOn) {
          runServer(fetchFn, depVal).then(function(data){ if (!mounted) return; const list = Array.isArray(data) ? data.map(d=>({v:d.id||d.code||d.v,t:d.name||d.nama||d.t})) : []; setAsyncOptions(list); setLoadingOpts(false); }).catch(function(){ if (mounted) { setAsyncOptions([]); setLoadingOpts(false); } });
        } else {
          runServer(fetchFn).then(function(data){ if (!mounted) return; const list = Array.isArray(data) ? data.map(d=>({v:d.id||d.code||d.v,t:d.name||d.nama||d.t})) : []; setAsyncOptions(list); setLoadingOpts(false); }).catch(function(){ if (mounted) { setAsyncOptions([]); setLoadingOpts(false); } });
        }
      } catch(err) { if (mounted) { setAsyncOptions([]); setLoadingOpts(false); } console.warn('fetch err', err); }
    };

    let depVal = null;
    if (fetchDependsOn) {
      const sIdx = fetchDependsOn.stepIndex;
      const fName = fetchDependsOn.fieldName;
      depVal = (form[sIdx] && form[sIdx][fName] !== undefined) ? form[sIdx][fName] : null;
    }

    timer = setTimeout(()=> load(depVal), 220);
    return ()=> { mounted = false; if (timer) clearTimeout(timer); };
  }, [ fetchFn, (fetchDependsOn ? (form[fetchDependsOn.stepIndex] && form[fetchDependsOn.stepIndex][fetchDependsOn.fieldName]) : null) ]);

  function computeSelectOptions() {
    if (optionsMap && dependsOn) {
      const depVal = form[dependsOn.stepIndex] ? form[dependsOn.stepIndex][dependsOn.fieldName] : null;
      return (optionsMap[depVal]||[]).map(o=>({v:o.v,t:o.t}));
    }
    return options || [];
  }

  if (type === 'radio') {
    return (
      <FormControl component="fieldset" fullWidth>
        <FormLabel component="legend">{label}</FormLabel>
        <RadioGroup row={!!radioRow} value={value || ''} onChange={(ev) => onChange(ev.target.value)}>
          {(options || []).map((op, i) => (
            <FormControlLabel key={i} value={op.v} control={<Radio />} label={op.t} />
          ))}
        </RadioGroup>
        {error ? <Typography color="error" variant="caption">{error}</Typography> : null}
      </FormControl>
    );
  }

  if (type === 'rating') {
    const labels = ['Useless', 'Poor', 'Ok', 'Good', 'Excellent'];
    const [hover, setHover] = React.useState(-1);

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
        <FormLabel component="legend" sx={{ fontWeight: 500, mb: 0.5 }}>{label}</FormLabel>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Rating
            name={name}
            value={Number(value) || 0}
            precision={1}
            size="large"
            onChange={(event, newValue) => { onChange(newValue || 0); }}
            onChangeActive={(event, newHover) => { setHover(newHover); }}
          />
          <Typography variant="body2" sx={{ minWidth: 80 }}>
            {hover !== -1 ? labels[hover - 1] : (value ? labels[(Number(value) || 0) - 1] : '')}
          </Typography>
        </Box>
        {error ? <Typography color="error" variant="caption">{error}</Typography> : null}
      </Box>
    );
  }

  if (type === 'select') {
    const opts = computeSelectOptions();
    return (
      <TextField
        fullWidth
        variant="outlined"
        select
        label={label}
        value={value}
        onChange={(ev) => onChange(ev.target.value)}
        SelectProps={{ native: true }}
        InputLabelProps={{ shrink: true }}
        error={!!error}
        helperText={error}
      >
        <option value="">-- pilih --</option>
        {opts.map((op, idx) => <option key={idx} value={op.v}>{op.t}</option>)}
      </TextField>
    );
  }

  if (type === 'autocomplete') {
    const opts = (options || []).map(o=>({v:o.v,t:o.t})).concat(asyncOptions || []);
    const selected = opts.find(o => o.v === value) || null;
    return (
      <Autocomplete
        options={opts}
        getOptionLabel={(o) => o ? (o.t || '') : ''}
        value={selected}
        onChange={(ev, newVal) => onChange(newVal ? newVal.v : '')}
        isOptionEqualToValue={(option, val) => option && val ? option.v === val.v : false}
        loading={loadingOpts}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            label={label}
            InputLabelProps={{ shrink: true }}
            error={!!error}
            helperText={error}
          />
        )}
        freeSolo={!!field.freeSolo}
      />
    );
  }

  if (type === 'checkbox') {
    return (
      <FormControlLabel
        control={<Checkbox checked={!!value} onChange={(e) => onChange(e.target.checked)} />}
        label={label}
      />
    );
  }
  
  if (type === 'textarea') {
    return (
      <TextField
        fullWidth
        variant="outlined"
        multiline
        minRows={3}
        label={label}
        InputLabelProps={{ shrink: true }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={!!error}
        helperText={error}
      />
    );
  }

  return (
    <TextField
      fullWidth
      variant="outlined"
      label={label}
      InputLabelProps={{ shrink: true }}
      type={(field.type === 'number' ? 'number' : (field.type === 'date' ? 'date' : 'text'))}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={!!error}
      helperText={error}
    />
  );
}

function SpinnerWithLabel({ label }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={48} thickness={4} />
        <Typography variant="body1">{label || 'Memuat...'}</Typography>
      </Box>
    </Box>
  );
}

// --- KOMPONEN FORM UTAMA (dulu 'App', sekarang 'TracerForm') ---
export default function TracerForm() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [form, setForm] = React.useState(() => buildInitialState(stepsConfig));
  const [errors, setErrors] = React.useState(() => buildInitialErrors(stepsConfig));
  const [openSummary, setOpenSummary] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [snack, setSnack] = React.useState({ open:false, severity:'success', message:'' });
  const [summaryData, setSummaryData] = React.useState(null);
  const ratingLabels = ['Useless','Poor','Ok','Good','Excellent'];
  const totalSteps = stepsConfig.length;

  const cache = React.useRef({ provinces: null, countries: null, regencies: {} });

  async function getCachedProvinces() {
    if (cache.current.provinces) return cache.current.provinces;
    const p = await runServer('getProvinces'); cache.current.provinces = p || []; return cache.current.provinces;
  }
  async function getCachedCountries() {
    if (cache.current.countries) return cache.current.countries;
    const c = await runServer('getCountries'); cache.current.countries = c || []; return cache.current.countries;
  }
  async function getCachedRegencies(provId) {
    if (!provId) return [];
    if (cache.current.regencies[provId]) return cache.current.regencies[provId];
    const r = await runServer('getRegencies', provId); cache.current.regencies[provId] = r || []; return cache.current.regencies[provId];
  }

  function shouldShowField(stepIndex, field) {
    if (field.showIfMulti && Array.isArray(field.showIfMulti)) {
      return field.showIfMulti.some(dep => {
        const depVal = form[stepIndex] ? form[stepIndex][dep.fieldName] : null;
        if (Array.isArray(dep.value)) return dep.value.includes(depVal);
        return depVal === dep.value;
      });
    }
    if (!field.showIf) return true;
    const dep = field.showIf; const depVal = form[stepIndex] ? form[stepIndex][dep.fieldName] : null;
    if (Array.isArray(dep.value)) return dep.value.includes(depVal); return depVal === dep.value;
  }

  function validateStep(stepIndex) {
    const cfg = stepsConfig[stepIndex]; const stepValues = form[stepIndex]; const stepErrors = {}; let ok = true;
    cfg.fields.forEach(f => {
      if (!shouldShowField(stepIndex, f)) return;
      const val = stepValues[f.name];
      if (f.required) {
        if (f.type === 'checkbox') { if (!val) { stepErrors[f.name] = 'Harap centang ini'; ok = false; return; } }
        else if (f.type === 'rating') { if (!val || Number(val) <= 0) { stepErrors[f.name] = 'Harap beri penilaian'; ok = false; return; } }
        else { if (val === '' || val === null || typeof val === 'undefined') { stepErrors[f.name] = 'Wajib diisi'; ok = false; return; } }
      }
      if (f.type === 'gmail' && val) { const re = /^[^@\s]+@gmail\.com$/i; if (!re.test(val)) { stepErrors[f.name] = 'Harus menggunakan alamat Gmail (@gmail.com)'; ok = false; } }
    });
    setErrors(prev => { const copy = prev.map(s => ({ ...s })); copy[stepIndex] = Object.assign({}, copy[stepIndex], stepErrors); return copy; });
    return ok;
  }

  function batchSetField(stepIndex, name, value) {
    setForm(prev => {
      const cp = prev.map(p => ({ ...p })); if (cp[stepIndex]) cp[stepIndex][name] = value;
      stepsConfig.forEach((s, idx) => { s.fields.forEach(f => {
        if (f.dependsOn && f.dependsOn.stepIndex === stepIndex && f.dependsOn.fieldName === name) { if (cp[idx] && cp[idx][f.name] !== '') cp[idx][f.name] = ''; }
        if (f.fetchDependsOn && f.fetchDependsOn.stepIndex === stepIndex && f.fetchDependsOn.fieldName === name) { if (cp[idx] && cp[idx][f.name] !== '') cp[idx][f.name] = ''; }
      }); });
      return cp;
    });
    setErrors(prev => { const copy = prev.map(s => ({ ...s })); if (copy[stepIndex]) copy[stepIndex][name] = ''; return copy; });
  }

  function handleNext() { if (!validateStep(activeStep)) return; setActiveStep(prev => Math.min(totalSteps-1, prev+1)); }
  function handleBack() { setActiveStep(prev => Math.max(0, prev-1)); }
  function handleFinishClick() {
    if (!validateStep(activeStep)) return;
    setSummaryData(null);
    setOpenSummary(true);
    prepareSummary();
  }

  function collectPayload() { const payload = {}; stepsConfig.forEach((s, idx) => { payload['step_'+(idx+1)] = form[idx]; }); payload.meta = { submittedAt: new Date().toISOString() }; return payload; }

  async function prepareSummary() {
    setSummaryData(null);
    const sections = [];
    for (let sIdx = 0; sIdx < stepsConfig.length; sIdx++) {
      const step = stepsConfig[sIdx]; const obj = form[sIdx]; const entries = [];
      for (const f of step.fields) {
        if (!shouldShowField(sIdx, f)) continue;
        const raw = obj[f.name];
        let isEmpty = (raw === '' || raw === null || typeof raw === 'undefined');
        if (f.type === 'checkbox') isEmpty = !raw;
        if (f.type === 'rating') isEmpty = (!raw || Number(raw) <= 0);
        if (isEmpty) continue;
        let display = String(raw);
        if (f.type === 'rating') { const idx = Number(raw) || 0; display = idx > 0 ? ratingLabels[idx-1] + ' ('+idx+')' : ''; }
        if (f.type === 'autocomplete' && f.fetch) {
          try {
            if (f.fetch === 'getProvinces') { const provinces = await getCachedProvinces(); const found = Array.isArray(provinces) && provinces.find(p => String(p.id||p.code||p.v) === String(raw)); if (found) display = found.name || found.nama || found.t || String(raw); } 
            else if (f.fetch === 'getRegencies') { const depStep = (f.fetchDependsOn && typeof f.fetchDependsOn.stepIndex === 'number') ? f.fetchDependsOn.stepIndex : 0; const depField = (f.fetchDependsOn && f.fetchDependsOn.fieldName) ? f.fetchDependsOn.fieldName : 'provinsi'; const provVal = (form[depStep] || {})[depField]; const regencies = await getCachedRegencies(provVal); const found = Array.isArray(regencies) && regencies.find(r => String(r.id||r.code||r.v) === String(raw)); if (found) display = found.name || found.nama || found.t || String(raw); } 
            else if (f.fetch === 'getCountries') { const countries = await getCachedCountries(); const found = Array.isArray(countries) && countries.find(c => String(c.id||c.code||c.v) === String(raw)); if (found) display = found.name || found.nama || found.t || String(raw); }
          } catch (e) { display = String(raw); }
        }
        if ((f.type === 'select' || f.type === 'radio') && f.options) { const op = f.options.find(o => String(o.v) === String(raw)); if (op) display = op.t || op.label || op.v; }
        entries.push({ name: f.name, label: f.label, display });
      }
      if (entries.length > 0) sections.push({ title: step.title, fields: entries });
    }
    setSummaryData(sections);
  }

  function handleConfirmSave() {
    setOpenSummary(false);
    const payload = collectPayload();
    setSaving(true);
    runServer('saveForm', payload).then(function(resp){
      setSaving(false);
      if (resp && resp.ok) {
        setSnack({ open:true, severity:'success', message: 'Sukses: '+(resp.message||'Tersimpan') });
        setActiveStep(totalSteps);
      } else {
        setSnack({ open:true, severity:'error', message: 'Server error' });
      }
    }).catch(function(err){
      setSaving(false);
      console.error(err);
      setSnack({ open:true, severity:'error', message: 'Gagal menyimpan: '+ (err && err.message ? err.message : '') });
    });
  }

  function renderStepFields(stepIndex) {
    const cfg = stepsConfig[stepIndex];
    return (
      <Grid container spacing={2}>
        {cfg.fields.map((f) => {
          if (!shouldShowField(stepIndex, f)) return null;
          return (
            <Grid item xs={12} md={4} key={f.name}>
              <DynamicField
                field={f}
                value={form[stepIndex][f.name]}
                onChange={(v) => batchSetField(stepIndex, f.name, v)}
                error={errors[stepIndex][f.name]}
                form={form}
              />
            </Grid>
          );
        })}
      </Grid>
    );
  }

  function renderSummaryContent() {
    if (!summaryData) return <SpinnerWithLabel label="Menyiapkan ringkasan…" />;
    const listItems = summaryData.map((section, sIdx) => {
      const secondaryText = section.fields.map(f => `${f.label}: ${f.display}`).join(' | ');
      return (
        <React.Fragment key={sIdx}>
          <ListItem>
            <ListItemText primary={section.title} secondary={secondaryText} />
          </ListItem>
          <Divider component="li" />
        </React.Fragment>
      );
    });
    return <List>{listItems}</List>;
  }

  return (
    <React.Fragment>
      <Box sx={{ width: '100%' }}>
        {/* Judul H5 dari MUI saya sembunyikan, karena kita sudah punya judul di App.jsx */}
        <Typography variant="h5" gutterBottom sx={{ display: 'none' }}>
          Form Tracer Study 2025 Alumni GREAT Edunesia Dompet Dhuafa
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mt: 2, mb: 2 }}>
          {stepsConfig.map((s, idx) => (
            <Step key={s.title}>
              <StepLabel>{s.title}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === totalSteps ? (
          <React.Fragment>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography>Semua langkah selesai — data berhasil dikirim!</Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2">Ringkasan (JSON):</Typography>
                <Box component="pre" sx={{ p: 1, bgcolor: '#f4f6fb', borderRadius: 1, maxHeight: 300, overflow: 'auto' }}>
                  {JSON.stringify(collectPayload(), null, 2)}
                </Box>
              </Box>
            </Paper>
            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
              <Box sx={{ flex: '1 1 auto' }} />
              <Button onClick={() => { setActiveStep(0); setForm(buildInitialState(stepsConfig)); setErrors(buildInitialErrors(stepsConfig)); }}>
                Isi Form Kembali
              </Button>
            </Box>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Paper sx={{ p: 2, mb: 2, mt: 3 }}>
              {/* <Typography sx={{ mb: 2 }}>{stepsConfig[activeStep].title} (Step {activeStep + 1} / {totalSteps})</Typography> */}
              {renderStepFields(activeStep)}
              <Box sx={{ display: 'flex', flexDirection: 'row', pt: 3 }}>
                <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
                  Back
                </Button>
                <Box sx={{ flex: '1 1 auto' }} />
                {activeStep === totalSteps - 1 ? (
                  <Button onClick={handleFinishClick} variant="contained" disabled={saving}>
                    {saving ? 'Menyimpan...' : 'Finish & Submit'}
                  </Button>
                ) : (
                  <Button onClick={handleNext} variant="contained">
                    Next
                  </Button>
                )}
              </Box>
            </Paper>
          </React.Fragment>
        )}

        <Dialog open={openSummary} onClose={() => { setOpenSummary(false); setSummaryData(null); }} maxWidth="md" fullWidth>
          <DialogTitle>Ringkasan — Konfirmasi sebelum Simpan</DialogTitle>
          <DialogContent dividers>
            <Typography variant="subtitle2" gutterBottom>Periksa kembali isi form:</Typography>
            {renderSummaryContent()}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setOpenSummary(false); setSummaryData(null); }}>Batal</Button>
            <Button variant="contained" onClick={handleConfirmSave} disabled={saving}>
              {saving ? 'Menyimpan...' : 'Konfirmasi & Simpan'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snack.open} autoHideDuration={5000} onClose={() => setSnack(prev => ({ ...prev, open: false }))}>
          <Alert severity={snack.severity} onClose={() => setSnack(prev => ({ ...prev, open: false }))} sx={{ width: '100%' }}>
            {snack.message}
          </Alert>
        </Snackbar>
      </Box>
    </React.Fragment>
  );
}