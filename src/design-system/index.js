// Puente al sistema de diseño "Gaia Factions" (bundle.js sin modificar).
// El orden importa: primero React como global, después el bundle, que llena window.GaiaFactions.
import './react-global.js';
import './bundle.js';

const G = window.GaiaFactions;

export const {
  Logo, Icon, Button, IconButton, Panel, Banner, Badge, PlanetToken, ResourceToken, ResearchTrack, ScoringTile, Meter,
  FactionCard, FactionRankRow, TextField, Select, Checkbox, Switch, SegmentedControl, Tabs, Tooltip, Toast, Modal, EmptyState,
  FACTIONS, PLANETS, TRACKS, RESOURCES, DIFFICULTY, ICON_NAMES,
} = G;

export default G;
