import { SETTINGS_ROWS } from "../../settings/schema";

export default function SettingGroup({ tab, group, settings, onChange }) {
  const rows = SETTINGS_ROWS.filter(
    (row) => row.tab === tab && row.group === group,
  );

  return (
    <>
      {group && <h3 className="modal-subtitle">{group}</h3>}
      <div className="setting-group">
        {rows.map((row) => (
          <SettingRow
            key={(row.toggle ?? row.color).key}
            row={row}
            settings={settings}
            onChange={onChange}
          />
        ))}
      </div>
    </>
  );
}

function SettingRow({ row, settings, onChange }) {
  const { toggle, color, label, description } = row;

  if (!toggle) {
    return (
      <ColorRow
        label={label}
        value={settings[color.key]}
        onChange={(v) => onChange(color.key, v)}
      />
    );
  }

  return (
    <ToggleRow
      label={label}
      description={description}
      enabled={settings[toggle.key]}
      onToggle={(v) => onChange(toggle.key, v)}
      color={color && settings[color.key]}
      onColor={color && ((v) => onChange(color.key, v))}
    />
  );
}

function ColorRow({ label, value, onChange }) {
  return (
    <label className="setting-row">
      <span className="setting-text">
        <span className="setting-label">{label}</span>
      </span>
      <input
        className="setting-color"
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function ToggleRow({ label, description, enabled, color, onToggle, onColor }) {
  return (
    <div className="setting-row">
      <label className="setting-main">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <span className="toggle-track" />
        <span className="setting-text">
          <span className="setting-label">{label}</span>
          <span className="setting-desc">{description}</span>
        </span>
      </label>

      {onColor && (
        <input
          className="setting-color"
          type="color"
          value={color}
          disabled={!enabled}
          onChange={(e) => onColor(e.target.value)}
          aria-label={`${label} color`}
        />
      )}
    </div>
  );
}
