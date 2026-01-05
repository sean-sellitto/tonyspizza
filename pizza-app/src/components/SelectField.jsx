export default function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label>{label}: </label>
      <select value={value} onChange={onChange}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
