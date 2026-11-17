// El bundle del sistema de diseño es un script clásico que lee window.React.
// Este módulo se importa antes que el bundle para exponer la misma instancia de React como global.
import React from 'react';

window.React = React;
