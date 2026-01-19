export default function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label>{label}: </label>
      <select value={value ?? ""} onChange={onChange}>
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
