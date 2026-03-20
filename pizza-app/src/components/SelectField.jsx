export default function SelectField({ label, value, onChange, options, id }) {
  const selectId = id || `select-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="form-control">
      <label htmlFor={selectId}>{label}</label>
      <select id={selectId} value={value ?? ""} onChange={onChange}>
        {options.map((opt, index) => (
          <option
            key={`${opt.value}-${index}`}
            value={opt.value}
            disabled={opt.disabled}
          >
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
