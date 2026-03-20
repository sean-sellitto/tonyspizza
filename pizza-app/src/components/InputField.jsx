export default function InputField({
  label,
  value,
  onChange,
  type = "text",
  id,
  ...rest
}) {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="form-control">
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} type={type} value={value} onChange={onChange} required {...rest} />
    </div>
  );
}
