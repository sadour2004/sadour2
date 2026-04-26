/**
 * Die Centre Management - Google Sheets Apps Script
 * Professional sheet-based form (no HTML modal) with:
 * - Form sheet: "Form"
 * - Data sheet: "date"
 */

const CONFIG = {
  formSheetName: 'Form',
  dataSheetName: 'date',
  dataHeaders: [
    'DateHeure',
    'Technicien',
    'Shift',
    'Référence',
    "Type d'Équipement",
    "Type d'Action",
    'Durée (min)',
    'Statut'
  ],
  options: {
    shifts: ['Matin', 'Après-midi', 'Nuit'],
    equipTypes: ['Imprimante', 'Vérin', 'Setup', 'Appareil adhésif', 'Moule', 'Presse', 'Autre'],
    actionTypes: ['Réparation', 'Vérification', 'Maintenance préventive', 'Diagnostic', 'Réglage', 'Changement pièce'],
    status: ['Terminé', 'En attente', 'En cours', 'Bloqué'],
    techniciens: ['Tech A', 'Tech B', 'Tech C']
  },
  ui: {
    title: 'DIE CENTRE MANAGEMENT',
    subtitle: 'Professional Maintenance Intervention Control Panel'
  },
  ranges: {
    dateHeure: 'D8:F8',
    reference: 'I8:J8',
    technicien: 'D10:F10',
    shift: 'I10:J10',
    typeEquipement: 'D12:F12',
    typeAction: 'I12:J12',
    duree: 'D14:F14',
    statut: 'I14:J14',
    buttonSearch: 'B19:C20',
    buttonSave: 'D19:E20',
    buttonModify: 'F19:G20',
    buttonClear: 'H19:I20',
    helperOriginalRef: 'Z1',
    helperRowNumber: 'Z2'
  }
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Die Center')
    .addItem('Open Die Centre Form', 'openDieCentreForm')
    .addItem('Rebuild Professional Form', 'setupFormSheet')
    .addSeparator()
    .addItem('Search by Reference', 'searchByReference')
    .addItem('Save New Intervention', 'saveNewIntervention')
    .addItem('Modify Intervention', 'modifyIntervention')
    .addItem('Clear Form', 'clearForm')
    .addToUi();

  ensureSheets_();
}

/**
 * Triggered when user selects cells; clicking action button cells runs actions.
 */
function onSelectionChange(e) {
  if (!e || !e.range) return;
  const range = e.range;
  const sheet = range.getSheet();
  if (sheet.getName() !== CONFIG.formSheetName) return;

  if (isRangeIntersecting_(range, sheet.getRange(CONFIG.ranges.buttonSearch))) {
    searchByReference();
    return;
  }
  if (isRangeIntersecting_(range, sheet.getRange(CONFIG.ranges.buttonSave))) {
    saveNewIntervention();
    return;
  }
  if (isRangeIntersecting_(range, sheet.getRange(CONFIG.ranges.buttonModify))) {
    modifyIntervention();
    return;
  }
  if (isRangeIntersecting_(range, sheet.getRange(CONFIG.ranges.buttonClear))) {
    clearForm();
  }
}

function openDieCentreForm() {
  setupFormSheet();
  const ss = SpreadsheetApp.getActive();
  const formSheet = ss.getSheetByName(CONFIG.formSheetName);
  ss.setActiveSheet(formSheet);
  toast_('Die Centre form is ready.', 'Die Center');
}

/**
 * Creates/refreshes the professional form layout.
 * Safe to run multiple times; always rebuilds a clean design.
 */
function setupFormSheet() {
  const ss = SpreadsheetApp.getActive();
  ensureSheets_();

  const formSheet = ss.getSheetByName(CONFIG.formSheetName);
  formSheet.showSheet();
  formSheet.setHiddenGridlines(true);

  formSheet.getRange('A1:Z200').breakApart();
  formSheet.clear({ contentsOnly: false });

  // Layout sizing
  formSheet.setColumnWidths(1, 1, 18); // A margin
  formSheet.setColumnWidths(2, 9, 120); // B:J main area
  formSheet.setColumnWidths(11, 14, 30); // K:X spacer
  formSheet.setColumnWidth(25, 30); // Y
  formSheet.setColumnWidth(26, 10); // Z helper
  formSheet.setRowHeights(2, 25, 30);

  // Base canvas
  const canvas = formSheet.getRange('B2:J24');
  canvas
    .setBackground('#F3F6F8')
    .setFontFamily('Arial')
    .setFontColor('#0F172A');
  canvas.setBorder(true, true, true, true, true, true, '#CBD5E1', SpreadsheetApp.BorderStyle.SOLID);

  // Header
  formSheet.getRange('B2:J4').setBackground('#0B1F3A');
  formSheet.getRange('B2:J3').merge();
  formSheet
    .getRange('B2')
    .setValue(CONFIG.ui.title)
    .setFontSize(24)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setFontColor('#FFFFFF');
  formSheet.getRange('B4:J4').merge();
  formSheet
    .getRange('B4')
    .setValue(CONFIG.ui.subtitle)
    .setFontSize(11)
    .setFontWeight('normal')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setFontColor('#C7D2FE');

  // Section headers
  styleSectionHeader_(formSheet.getRange('B6:J6').merge(), 'Intervention Details');
  styleSectionHeader_(formSheet.getRange('B11:J11').merge(), 'Technical Information');
  styleSectionHeader_(formSheet.getRange('B17:J17').merge(), 'Action Center');

  // Labels
  setLabel_(formSheet, 'B8:C8', 'Date / Heure');
  setLabel_(formSheet, 'G8:H8', 'Référence');
  setLabel_(formSheet, 'B10:C10', 'Technicien');
  setLabel_(formSheet, 'G10:H10', 'Shift');
  setLabel_(formSheet, 'B12:C12', "Type d'Équipement");
  setLabel_(formSheet, 'G12:H12', "Type d'Action");
  setLabel_(formSheet, 'B14:C14', 'Durée (min)');
  setLabel_(formSheet, 'G14:H14', 'Statut');

  // Merge input areas for clean form look
  formSheet.getRange(CONFIG.ranges.dateHeure).merge();
  formSheet.getRange(CONFIG.ranges.reference).merge();
  formSheet.getRange(CONFIG.ranges.technicien).merge();
  formSheet.getRange(CONFIG.ranges.shift).merge();
  formSheet.getRange(CONFIG.ranges.typeEquipement).merge();
  formSheet.getRange(CONFIG.ranges.typeAction).merge();
  formSheet.getRange(CONFIG.ranges.duree).merge();
  formSheet.getRange(CONFIG.ranges.statut).merge();

  // Input styling
  [
    CONFIG.ranges.dateHeure,
    CONFIG.ranges.reference,
    CONFIG.ranges.technicien,
    CONFIG.ranges.shift,
    CONFIG.ranges.typeEquipement,
    CONFIG.ranges.typeAction,
    CONFIG.ranges.duree,
    CONFIG.ranges.statut
  ].forEach((a1) => styleInput_(formSheet.getRange(a1)));

  // Button styling
  styleButton_(formSheet.getRange(CONFIG.ranges.buttonSearch).merge(), 'SEARCH', '#2563EB');
  styleButton_(formSheet.getRange(CONFIG.ranges.buttonSave).merge(), 'SAVE', '#16A34A');
  styleButton_(formSheet.getRange(CONFIG.ranges.buttonModify).merge(), 'MODIFY', '#EA580C');
  styleButton_(formSheet.getRange(CONFIG.ranges.buttonClear).merge(), 'CLEAR', '#6B7280');

  // Guidance text
  formSheet
    .getRange('B22:J22')
    .merge()
    .setValue('Tip: Enter Référence then use SEARCH before MODIFY. Click colored button cells to run actions.')
    .setFontSize(9)
    .setFontColor('#475569')
    .setHorizontalAlignment('center')
    .setBackground('#E2E8F0');

  applyFormValidations_(formSheet);
  clearForm();
}

function searchByReference() {
  ensureSheets_();
  const ss = SpreadsheetApp.getActive();
  const formSheet = ss.getSheetByName(CONFIG.formSheetName);
  const dataSheet = ss.getSheetByName(CONFIG.dataSheetName);

  const ref = String(formSheet.getRange(CONFIG.ranges.reference).getDisplayValue()).trim();
  if (!ref) {
    toast_('Veuillez saisir une Référence avant SEARCH.', 'Erreur');
    return;
  }

  const found = findReferenceRow_(dataSheet, ref);
  if (!found) {
    toast_(`Référence "${ref}" introuvable dans "${CONFIG.dataSheetName}".`, 'Erreur');
    return;
  }

  const values = dataSheet.getRange(found.row, 1, 1, 8).getValues()[0];
  setFormValues_(formSheet, values);
  formSheet.getRange(CONFIG.ranges.helperOriginalRef).setValue(values[3]);
  formSheet.getRange(CONFIG.ranges.helperRowNumber).setValue(found.row);

  toast_(`Intervention chargée (ligne ${found.row}).`, 'Succès');
}

function saveNewIntervention() {
  ensureSheets_();
  const ss = SpreadsheetApp.getActive();
  const formSheet = ss.getSheetByName(CONFIG.formSheetName);
  const dataSheet = ss.getSheetByName(CONFIG.dataSheetName);

  const payload = getFormValues_(formSheet);
  const validationError = validatePayload_(payload);
  if (validationError) {
    toast_(validationError, 'Erreur');
    return;
  }

  const existing = findReferenceRow_(dataSheet, payload.reference);
  if (existing) {
    toast_(`La Référence "${payload.reference}" existe déjà. Utilisez MODIFY.`, 'Erreur');
    return;
  }

  dataSheet.appendRow([
    payload.dateHeure,
    payload.technicien,
    payload.shift,
    payload.reference,
    payload.typeEquipement,
    payload.typeAction,
    payload.duree,
    payload.statut
  ]);

  formSheet.getRange(CONFIG.ranges.helperOriginalRef).setValue(payload.reference);
  formSheet.getRange(CONFIG.ranges.helperRowNumber).setValue(dataSheet.getLastRow());

  toast_('Intervention enregistrée avec succès.', 'Succès');
}

function modifyIntervention() {
  ensureSheets_();
  const ss = SpreadsheetApp.getActive();
  const formSheet = ss.getSheetByName(CONFIG.formSheetName);
  const dataSheet = ss.getSheetByName(CONFIG.dataSheetName);

  const targetRow = Number(formSheet.getRange(CONFIG.ranges.helperRowNumber).getValue());
  const originalRef = String(formSheet.getRange(CONFIG.ranges.helperOriginalRef).getDisplayValue()).trim();
  if (!targetRow || !originalRef) {
    toast_('Utilisez SEARCH avec une Référence avant MODIFY.', 'Erreur');
    return;
  }

  if (targetRow < 2 || targetRow > dataSheet.getLastRow()) {
    toast_('La ligne ciblée n’est plus valide. Relancez SEARCH.', 'Erreur');
    return;
  }

  const payload = getFormValues_(formSheet);
  const validationError = validatePayload_(payload);
  if (validationError) {
    toast_(validationError, 'Erreur');
    return;
  }

  const duplicate = findReferenceRow_(dataSheet, payload.reference);
  if (duplicate && duplicate.row !== targetRow) {
    toast_(`La nouvelle Référence "${payload.reference}" existe déjà sur une autre ligne.`, 'Erreur');
    return;
  }

  dataSheet.getRange(targetRow, 1, 1, 8).setValues([[
    payload.dateHeure,
    payload.technicien,
    payload.shift,
    payload.reference,
    payload.typeEquipement,
    payload.typeAction,
    payload.duree,
    payload.statut
  ]]);

  formSheet.getRange(CONFIG.ranges.helperOriginalRef).setValue(payload.reference);
  formSheet.getRange(CONFIG.ranges.helperRowNumber).setValue(targetRow);

  toast_(`Intervention modifiée (ligne ${targetRow}).`, 'Succès');
}

function clearForm() {
  ensureSheets_();
  const formSheet = SpreadsheetApp.getActive().getSheetByName(CONFIG.formSheetName);
  [
    CONFIG.ranges.dateHeure,
    CONFIG.ranges.reference,
    CONFIG.ranges.technicien,
    CONFIG.ranges.shift,
    CONFIG.ranges.typeEquipement,
    CONFIG.ranges.typeAction,
    CONFIG.ranges.duree,
    CONFIG.ranges.statut
  ].forEach((a1) => formSheet.getRange(a1).clearContent());

  formSheet.getRange(CONFIG.ranges.helperOriginalRef).clearContent();
  formSheet.getRange(CONFIG.ranges.helperRowNumber).clearContent();

  // Optional convenience default
  formSheet.getRange(CONFIG.ranges.dateHeure).setValue(new Date());

  toast_('Formulaire vidé.', 'Die Center');
}

/**
 * Ensures both required sheets exist and data sheet is correctly prepared.
 */
function ensureSheets_() {
  const ss = SpreadsheetApp.getActive();
  let formSheet = ss.getSheetByName(CONFIG.formSheetName);
  let dataSheet = ss.getSheetByName(CONFIG.dataSheetName);

  if (!formSheet) formSheet = ss.insertSheet(CONFIG.formSheetName);
  if (!dataSheet) dataSheet = ss.insertSheet(CONFIG.dataSheetName);

  setupDataSheet_(dataSheet);

  // Hide helper column if visible
  if (!formSheet.isColumnHiddenByUser(26)) {
    formSheet.hideColumns(26);
  }
}

/**
 * Applies robust headers and formatting for the "date" sheet.
 */
function setupDataSheet_(sheet) {
  sheet.getRange('A1:H1').setValues([CONFIG.dataHeaders]);
  sheet.setFrozenRows(1);
  sheet.setColumnWidths(1, 8, 165);
  sheet.getRange('A1:H1')
    .setBackground('#0B1F3A')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');
  sheet.getRange('A:H').setBorder(true, true, true, true, true, true, '#CBD5E1', SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange('A2:H').setBackground('#FFFFFF');
  sheet.getRange('A:A').setNumberFormat('yyyy-mm-dd hh:mm');
  sheet.getRange('G:G').setNumberFormat('0');
}

function applyFormValidations_(sheet) {
  const strictList = (items) =>
    SpreadsheetApp.newDataValidation().requireValueInList(items, true).setAllowInvalid(false).build();
  const relaxedList = (items) =>
    SpreadsheetApp.newDataValidation().requireValueInList(items, true).setAllowInvalid(true).build();

  sheet.getRange(CONFIG.ranges.shift).setDataValidation(strictList(CONFIG.options.shifts));
  sheet.getRange(CONFIG.ranges.typeEquipement).setDataValidation(strictList(CONFIG.options.equipTypes));
  sheet.getRange(CONFIG.ranges.typeAction).setDataValidation(strictList(CONFIG.options.actionTypes));
  sheet.getRange(CONFIG.ranges.statut).setDataValidation(strictList(CONFIG.options.status));
  sheet.getRange(CONFIG.ranges.technicien).setDataValidation(relaxedList(CONFIG.options.techniciens));
}

function getFormValues_(sheet) {
  return {
    dateHeure: sheet.getRange(CONFIG.ranges.dateHeure).getValue(),
    technicien: String(sheet.getRange(CONFIG.ranges.technicien).getDisplayValue()).trim(),
    shift: String(sheet.getRange(CONFIG.ranges.shift).getDisplayValue()).trim(),
    reference: String(sheet.getRange(CONFIG.ranges.reference).getDisplayValue()).trim(),
    typeEquipement: String(sheet.getRange(CONFIG.ranges.typeEquipement).getDisplayValue()).trim(),
    typeAction: String(sheet.getRange(CONFIG.ranges.typeAction).getDisplayValue()).trim(),
    duree: Number(sheet.getRange(CONFIG.ranges.duree).getValue()),
    statut: String(sheet.getRange(CONFIG.ranges.statut).getDisplayValue()).trim()
  };
}

function setFormValues_(sheet, rowValues) {
  sheet.getRange(CONFIG.ranges.dateHeure).setValue(rowValues[0]);
  sheet.getRange(CONFIG.ranges.technicien).setValue(rowValues[1]);
  sheet.getRange(CONFIG.ranges.shift).setValue(rowValues[2]);
  sheet.getRange(CONFIG.ranges.reference).setValue(rowValues[3]);
  sheet.getRange(CONFIG.ranges.typeEquipement).setValue(rowValues[4]);
  sheet.getRange(CONFIG.ranges.typeAction).setValue(rowValues[5]);
  sheet.getRange(CONFIG.ranges.duree).setValue(rowValues[6]);
  sheet.getRange(CONFIG.ranges.statut).setValue(rowValues[7]);
}

function validatePayload_(payload) {
  if (!payload.dateHeure) return 'Le champ Date / Heure est obligatoire.';
  if (!payload.technicien) return 'Le champ Technicien est obligatoire.';
  if (!payload.shift) return 'Le champ Shift est obligatoire.';
  if (!payload.reference) return 'Le champ Référence est obligatoire.';
  if (!payload.typeEquipement) return "Le champ Type d'Équipement est obligatoire.";
  if (!payload.typeAction) return "Le champ Type d'Action est obligatoire.";
  if (Number.isNaN(payload.duree)) return 'Le champ Durée (min) doit être un nombre.';
  if (!payload.statut) return 'Le champ Statut est obligatoire.';
  return '';
}

function findReferenceRow_(sheet, reference) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;
  const refs = sheet.getRange(2, 4, lastRow - 1, 1).getDisplayValues();
  for (let i = 0; i < refs.length; i++) {
    if (String(refs[i][0]).trim() === reference) {
      return { row: i + 2 };
    }
  }
  return null;
}

function styleSectionHeader_(range, text) {
  range
    .setValue(text)
    .setBackground('#0F766E')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setHorizontalAlignment('left')
    .setVerticalAlignment('middle')
    .setFontSize(11)
    .setBorder(true, true, true, true, true, true, '#0B1F3A', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
}

function setLabel_(sheet, a1, text) {
  sheet
    .getRange(a1)
    .merge()
    .setValue(text)
    .setBackground('#E2E8F0')
    .setFontColor('#0F172A')
    .setFontWeight('bold')
    .setHorizontalAlignment('left')
    .setVerticalAlignment('middle')
    .setBorder(true, true, true, true, true, true, '#94A3B8', SpreadsheetApp.BorderStyle.SOLID);
}

function styleInput_(range) {
  range
    .setBackground('#FFFFFF')
    .setFontColor('#0F172A')
    .setFontSize(10)
    .setHorizontalAlignment('left')
    .setVerticalAlignment('middle')
    .setBorder(true, true, true, true, true, true, '#64748B', SpreadsheetApp.BorderStyle.SOLID);
}

function styleButton_(range, label, color) {
  range
    .setValue(label)
    .setBackground(color)
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setFontSize(11)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setBorder(true, true, true, true, true, true, '#1E293B', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
}

function toast_(message, title) {
  SpreadsheetApp.getActive().toast(message, title || 'Die Center', 4);
}

function isRangeIntersecting_(a, b) {
  const aStartRow = a.getRow();
  const aEndRow = aStartRow + a.getNumRows() - 1;
  const aStartCol = a.getColumn();
  const aEndCol = aStartCol + a.getNumColumns() - 1;

  const bStartRow = b.getRow();
  const bEndRow = bStartRow + b.getNumRows() - 1;
  const bStartCol = b.getColumn();
  const bEndCol = bStartCol + b.getNumColumns() - 1;

  const rowsIntersect = aStartRow <= bEndRow && aEndRow >= bStartRow;
  const colsIntersect = aStartCol <= bEndCol && aEndCol >= bStartCol;
  return rowsIntersect && colsIntersect;
}
