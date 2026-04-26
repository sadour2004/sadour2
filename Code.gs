/**
 * Die Centre Management - Google Sheets Apps Script
 * Professional sheet-based form (no HTML modal) with:
 * - Form sheet: "Form"
 * - Data sheet: "date"
 */

const CONFIG = {
  FORM_SHEET: 'Form',
  DATA_SHEET: 'date',
  TITLE: 'DIE CENTRE MANAGEMENT',
  SUBTITLE: 'Professional Maintenance Intervention Control Panel',
  FIELDS: {
    dateHeure: 'D8',
    technicien: 'D10',
    shift: 'D12',
    reference: 'D14',
    typeEquipement: 'D16',
    typeAction: 'D18',
    duree: 'D20',
    statut: 'D22'
  },
  INPUT_RANGE: 'D8:G22',
  HIDDEN: {
    originalRef: 'Z1', // original reference loaded by SEARCH
    sourceRow: 'Z2' // source row loaded by SEARCH
  },
  BUTTONS: {
    search: { rowStart: 26, rowEnd: 27, colStart: 2, colEnd: 3, label: 'SEARCH' },
    save: { rowStart: 26, rowEnd: 27, colStart: 4, colEnd: 5, label: 'SAVE' },
    modify: { rowStart: 26, rowEnd: 27, colStart: 6, colEnd: 7, label: 'MODIFY' },
    clear: { rowStart: 26, rowEnd: 27, colStart: 8, colEnd: 9, label: 'CLEAR' }
  },
  OPTIONS: {
    shifts: ['Matin', 'Après-midi', 'Nuit'],
    equipTypes: ['Imprimante', 'Vérin', 'Setup', 'Appareil adhésif', 'Moule', 'Presse', 'Autre'],
    actionTypes: ['Réparation', 'Vérification', 'Maintenance préventive', 'Diagnostic', 'Réglage', 'Changement pièce'],
    status: ['Terminé', 'En attente', 'En cours', 'Bloqué'],
    techniciens: ['Tech A', 'Tech B', 'Tech C']
  },
  HEADERS: ['DateHeure', 'Technicien', 'Shift', 'Référence', "Type d'Équipement", "Type d'Action", 'Durée (min)', 'Statut'],
  COLORS: {
    navy: '#0F1E3A',
    teal: '#0E7C86',
    tealLight: '#E6F4F5',
    white: '#FFFFFF',
    softGray: '#F4F6F8',
    border: '#C7D0D9',
    searchBlue: '#1E5AA8',
    saveGreen: '#2E8B57',
    modifyOrange: '#E67E22',
    clearGray: '#6C7A89'
  }
};

/**
 * Adds custom menu.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Die Center')
    .addItem('Open Die Centre Form', 'openDieCentreForm')
    .addItem('Rebuild Professional Form', 'setupFormSheet')
    .addSeparator()
    .addItem('Search by Reference', 'searchIntervention')
    .addItem('Save New Intervention', 'saveIntervention')
    .addItem('Modify Intervention', 'modifyIntervention')
    .addItem('Clear Form', 'clearForm')
    .addToUi();
}

/**
 * Handles sheet "button" clicks based on selected cell/range.
 * @param {GoogleAppsScript.Events.SheetsOnSelectionChange} e
 */
function onSelectionChange(e) {
  if (!e || !e.range) return;
  const sheet = e.range.getSheet();
  if (sheet.getName() !== CONFIG.FORM_SHEET) return;

  const r = e.range.getRow();
  const c = e.range.getColumn();

  if (isInsideButton_(r, c, CONFIG.BUTTONS.search)) return searchIntervention();
  if (isInsideButton_(r, c, CONFIG.BUTTONS.save)) return saveIntervention();
  if (isInsideButton_(r, c, CONFIG.BUTTONS.modify)) return modifyIntervention();
  if (isInsideButton_(r, c, CONFIG.BUTTONS.clear)) return clearForm();
}

/**
 * Opens/creates the professional form.
 */
function openDieCentreForm() {
  const ss = SpreadsheetApp.getActive();
  const form = getOrCreateSheet_(CONFIG.FORM_SHEET);
  ensureDataSheet_();
  ss.setActiveSheet(form);
  if (form.getLastRow() === 0) setupFormSheet();
}

/**
 * Rebuilds the full professional form layout cleanly.
 */
function setupFormSheet() {
  const ss = SpreadsheetApp.getActive();
  const sh = getOrCreateSheet_(CONFIG.FORM_SHEET);
  ensureDataSheet_();

  sh.clear({ contentsOnly: false });
  sh.clearConditionalFormatRules();
  sh.setHiddenGridlines(true);
  sh.setFrozenRows(0);
  sh.setTabColor(CONFIG.COLORS.navy);

  // Columns and rows sizing
  const widths = [40, 150, 150, 160, 160, 160, 160, 140, 140];
  widths.forEach((w, i) => sh.setColumnWidth(i + 1, w));
  for (let i = 1; i <= 35; i++) sh.setRowHeight(i, 28);
  sh.setRowHeight(1, 42);
  sh.setRowHeight(2, 42);
  sh.setRowHeight(4, 30);
  sh.setRowHeight(6, 32);
  sh.setRowHeight(24, 32);
  sh.setRowHeights(26, 2, 36);

  // Base background panel
  sh.getRange('A1:I35').setBackground(CONFIG.COLORS.softGray);

  // Header
  sh.getRange('A1:I3').merge().setValue(CONFIG.TITLE)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setFontColor(CONFIG.COLORS.white)
    .setBackground(CONFIG.COLORS.navy)
    .setFontSize(24)
    .setFontWeight('bold');

  sh.getRange('A4:I4').merge().setValue(CONFIG.SUBTITLE)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setFontColor(CONFIG.COLORS.navy)
    .setBackground('#DDE7F5')
    .setFontSize(11)
    .setFontStyle('italic');

  // Section headers
  styleSectionHeader_(sh.getRange('B6:I6').merge().setValue('Intervention Details'));
  styleSectionHeader_(sh.getRange('B15:I15').merge().setValue('Technical Information'));
  styleSectionHeader_(sh.getRange('B24:I24').merge().setValue('Action Center'));

  // Label and input blocks
  const labels = [
    ['B8:C8', 'Date / Heure'],
    ['B10:C10', 'Technicien'],
    ['B12:C12', 'Shift'],
    ['B14:C14', 'Référence'],
    ['B16:C16', "Type d'Équipement"],
    ['B18:C18', "Type d'Action"],
    ['B20:C20', 'Durée (min)'],
    ['B22:C22', 'Statut']
  ];

  labels.forEach(item => {
    sh.getRange(item[0]).merge().setValue(item[1])
      .setBackground(CONFIG.COLORS.white)
      .setFontWeight('bold')
      .setHorizontalAlignment('left')
      .setVerticalAlignment('middle')
      .setBorder(true, true, true, true, true, true, CONFIG.COLORS.border, SpreadsheetApp.BorderStyle.SOLID);
  });

  const inputRanges = ['D8:G8', 'D10:G10', 'D12:G12', 'D14:G14', 'D16:G16', 'D18:G18', 'D20:G20', 'D22:G22'];
  inputRanges.forEach(rngA1 => {
    sh.getRange(rngA1).merge()
      .setBackground(CONFIG.COLORS.white)
      .setHorizontalAlignment('left')
      .setVerticalAlignment('middle')
      .setBorder(true, true, true, true, true, true, CONFIG.COLORS.border, SpreadsheetApp.BorderStyle.SOLID);
  });

  // Input formatting defaults
  sh.getRange(CONFIG.FIELDS.dateHeure).setNumberFormat('dd/MM/yyyy HH:mm').setValue(new Date());
  sh.getRange(CONFIG.FIELDS.duree).setNumberFormat('0');

  applyValidations_(sh);
  buildButtons_(sh);

  // Hide helper metadata column
  sh.getRange(CONFIG.HIDDEN.originalRef).setValue('');
  sh.getRange(CONFIG.HIDDEN.sourceRow).setValue('');
  sh.hideColumns(26); // Z

  ss.setActiveSheet(sh);
  sh.setActiveSelection(CONFIG.FIELDS.reference);
  toast_('Professional form rebuilt successfully.', 'Success');
}

/**
 * Saves a new intervention to "date" sheet.
 */
function saveIntervention() {
  const form = getOrCreateSheet_(CONFIG.FORM_SHEET);
  const dataSheet = ensureDataSheet_();
  const payload = readFormPayload_(form);
  if (!payload) return;

  const existing = findRowByReference_(dataSheet, payload.reference);
  if (existing > 0) {
    toast_("Cette référence existe déjà. Utilisez MODIFY pour mettre à jour l'intervention.", 'Erreur');
    return;
  }

  dataSheet.appendRow(payload.rowData);
  const newRow = dataSheet.getLastRow();
  form.getRange(CONFIG.HIDDEN.originalRef).setValue(payload.reference);
  form.getRange(CONFIG.HIDDEN.sourceRow).setValue(newRow);
  toast_('Intervention enregistrée avec succès.', 'Success');
}

/**
 * Searches intervention by reference and loads it into form.
 */
function searchIntervention() {
  const form = getOrCreateSheet_(CONFIG.FORM_SHEET);
  const dataSheet = ensureDataSheet_();
  const reference = normalize_(form.getRange(CONFIG.FIELDS.reference).getDisplayValue());

  if (!reference) {
    toast_("Veuillez saisir une Référence avant d'utiliser SEARCH.", 'Erreur');
    return;
  }

  const row = findRowByReference_(dataSheet, reference);
  if (row < 2) {
    form.getRange(CONFIG.HIDDEN.originalRef).setValue('');
    form.getRange(CONFIG.HIDDEN.sourceRow).setValue('');
    toast_('Référence introuvable dans la feuille "date".', 'Erreur');
    return;
  }

  const values = dataSheet.getRange(row, 1, 1, 8).getValues()[0];
  form.getRange(CONFIG.FIELDS.dateHeure).setValue(values[0]);
  form.getRange(CONFIG.FIELDS.technicien).setValue(values[1]);
  form.getRange(CONFIG.FIELDS.shift).setValue(values[2]);
  form.getRange(CONFIG.FIELDS.reference).setValue(values[3]);
  form.getRange(CONFIG.FIELDS.typeEquipement).setValue(values[4]);
  form.getRange(CONFIG.FIELDS.typeAction).setValue(values[5]);
  form.getRange(CONFIG.FIELDS.duree).setValue(values[6]);
  form.getRange(CONFIG.FIELDS.statut).setValue(values[7]);

  form.getRange(CONFIG.HIDDEN.originalRef).setValue(values[3]);
  form.getRange(CONFIG.HIDDEN.sourceRow).setValue(row);
  toast_('Intervention chargée dans le formulaire.', 'Success');
}

/**
 * Modifies an existing intervention previously loaded by SEARCH.
 */
function modifyIntervention() {
  const form = getOrCreateSheet_(CONFIG.FORM_SHEET);
  const dataSheet = ensureDataSheet_();
  const payload = readFormPayload_(form);
  if (!payload) return;

  const originalRef = normalize_(form.getRange(CONFIG.HIDDEN.originalRef).getDisplayValue());
  let sourceRow = Number(form.getRange(CONFIG.HIDDEN.sourceRow).getValue()) || 0;

  if (!originalRef) {
    toast_("Utilisez d'abord SEARCH pour charger l'intervention à modifier.", 'Erreur');
    return;
  }

  // Fallback if source row changed/invalid
  if (sourceRow < 2 || normalize_(dataSheet.getRange(sourceRow, 4).getDisplayValue()) !== originalRef) {
    sourceRow = findRowByReference_(dataSheet, originalRef);
  }

  if (sourceRow < 2) {
    toast_('Intervention source introuvable. Refaire SEARCH.', 'Erreur');
    return;
  }

  // If reference changed, verify uniqueness against other rows
  const duplicateRow = findRowByReference_(dataSheet, payload.reference);
  if (duplicateRow > 1 && duplicateRow !== sourceRow) {
    toast_("La nouvelle Référence existe déjà sur une autre ligne. Modification refusée.", 'Erreur');
    return;
  }

  dataSheet.getRange(sourceRow, 1, 1, 8).setValues([payload.rowData]);
  form.getRange(CONFIG.HIDDEN.originalRef).setValue(payload.reference);
  form.getRange(CONFIG.HIDDEN.sourceRow).setValue(sourceRow);
  toast_('Intervention modifiée avec succès.', 'Success');
}

/**
 * Clears form inputs only (keeps layout and data sheet).
 */
function clearForm() {
  const sh = getOrCreateSheet_(CONFIG.FORM_SHEET);
  [
    CONFIG.FIELDS.dateHeure,
    CONFIG.FIELDS.technicien,
    CONFIG.FIELDS.shift,
    CONFIG.FIELDS.reference,
    CONFIG.FIELDS.typeEquipement,
    CONFIG.FIELDS.typeAction,
    CONFIG.FIELDS.duree,
    CONFIG.FIELDS.statut
  ].forEach(a1 => sh.getRange(a1).clearContent());

  sh.getRange(CONFIG.FIELDS.dateHeure).setValue(new Date());
  sh.getRange(CONFIG.HIDDEN.originalRef).setValue('');
  sh.getRange(CONFIG.HIDDEN.sourceRow).setValue('');
  toast_('Formulaire vidé.', 'Success');
}

/**
 * Applies professional data validation lists.
 * Technicien keeps dropdown but allows manual entry.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sh
 */
function applyValidations_(sh) {
  const dvShift = SpreadsheetApp.newDataValidation()
    .requireValueInList(CONFIG.OPTIONS.shifts, true)
    .setAllowInvalid(false)
    .build();

  const dvEquip = SpreadsheetApp.newDataValidation()
    .requireValueInList(CONFIG.OPTIONS.equipTypes, true)
    .setAllowInvalid(false)
    .build();

  const dvAction = SpreadsheetApp.newDataValidation()
    .requireValueInList(CONFIG.OPTIONS.actionTypes, true)
    .setAllowInvalid(false)
    .build();

  const dvStatus = SpreadsheetApp.newDataValidation()
    .requireValueInList(CONFIG.OPTIONS.status, true)
    .setAllowInvalid(false)
    .build();

  const dvTech = SpreadsheetApp.newDataValidation()
    .requireValueInList(CONFIG.OPTIONS.techniciens, true)
    .setAllowInvalid(true) // allow custom technician typing
    .build();

  sh.getRange(CONFIG.FIELDS.shift).setDataValidation(dvShift);
  sh.getRange(CONFIG.FIELDS.typeEquipement).setDataValidation(dvEquip);
  sh.getRange(CONFIG.FIELDS.typeAction).setDataValidation(dvAction);
  sh.getRange(CONFIG.FIELDS.statut).setDataValidation(dvStatus);
  sh.getRange(CONFIG.FIELDS.technicien).setDataValidation(dvTech);
}

/**
 * Builds visual action buttons in sheet cells.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sh
 */
function buildButtons_(sh) {
  makeButton_(sh, CONFIG.BUTTONS.search, CONFIG.COLORS.searchBlue);
  makeButton_(sh, CONFIG.BUTTONS.save, CONFIG.COLORS.saveGreen);
  makeButton_(sh, CONFIG.BUTTONS.modify, CONFIG.COLORS.modifyOrange);
  makeButton_(sh, CONFIG.BUTTONS.clear, CONFIG.COLORS.clearGray);
}

/**
 * Creates one merged button style block.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sh
 * @param {{rowStart:number,rowEnd:number,colStart:number,colEnd:number,label:string}} cfg
 * @param {string} color
 */
function makeButton_(sh, cfg, color) {
  const rng = sh.getRange(cfg.rowStart, cfg.colStart, cfg.rowEnd - cfg.rowStart + 1, cfg.colEnd - cfg.colStart + 1);
  rng.merge()
    .setValue(cfg.label)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setFontWeight('bold')
    .setFontSize(11)
    .setFontColor(CONFIG.COLORS.white)
    .setBackground(color)
    .setBorder(true, true, true, true, true, true, '#4F5B66', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
}

/**
 * Ensures data sheet exists with required headers/format.
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function ensureDataSheet_() {
  const sh = getOrCreateSheet_(CONFIG.DATA_SHEET);
  sh.setTabColor(CONFIG.COLORS.teal);

  const headerRange = sh.getRange(1, 1, 1, CONFIG.HEADERS.length);
  const current = headerRange.getValues()[0];
  const shouldWrite = current.some((v, i) => normalize_(v) !== normalize_(CONFIG.HEADERS[i]));
  if (shouldWrite) headerRange.setValues([CONFIG.HEADERS]);

  headerRange
    .setBackground(CONFIG.COLORS.navy)
    .setFontColor(CONFIG.COLORS.white)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setBorder(true, true, true, true, true, true, CONFIG.COLORS.border, SpreadsheetApp.BorderStyle.SOLID);

  sh.setFrozenRows(1);
  sh.setColumnWidths(1, 8, 170);
  sh.setColumnWidth(7, 120);
  sh.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm');
  sh.getRange('G:G').setNumberFormat('0');
  return sh;
}

/**
 * Reads and validates form values.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sh
 * @returns {{reference:string,rowData:Array}|null}
 */
function readFormPayload_(sh) {
  const dateHeure = sh.getRange(CONFIG.FIELDS.dateHeure).getValue();
  const technicien = normalize_(sh.getRange(CONFIG.FIELDS.technicien).getDisplayValue());
  const shift = normalize_(sh.getRange(CONFIG.FIELDS.shift).getDisplayValue());
  const reference = normalize_(sh.getRange(CONFIG.FIELDS.reference).getDisplayValue());
  const typeEquipement = normalize_(sh.getRange(CONFIG.FIELDS.typeEquipement).getDisplayValue());
  const typeAction = normalize_(sh.getRange(CONFIG.FIELDS.typeAction).getDisplayValue());
  const dureeRaw = sh.getRange(CONFIG.FIELDS.duree).getDisplayValue();
  const statut = normalize_(sh.getRange(CONFIG.FIELDS.statut).getDisplayValue());

  if (!dateHeure || !technicien || !shift || !reference || !typeEquipement || !typeAction || !dureeRaw || !statut) {
    toast_('Veuillez remplir tous les champs obligatoires.', 'Erreur');
    return null;
  }

  const duree = Number(String(dureeRaw).replace(',', '.'));
  if (!isFinite(duree) || duree <= 0) {
    toast_('Durée (min) doit être un nombre supérieur à 0.', 'Erreur');
    return null;
  }

  return {
    reference,
    rowData: [dateHeure, technicien, shift, reference, typeEquipement, typeAction, duree, statut]
  };
}

/**
 * Finds row by exact normalized reference in col D.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} dataSheet
 * @param {string} reference
 * @returns {number} Row number (>=2) or -1
 */
function findRowByReference_(dataSheet, reference) {
  const lastRow = dataSheet.getLastRow();
  if (lastRow < 2) return -1;
  const values = dataSheet.getRange(2, 4, lastRow - 1, 1).getDisplayValues();
  const refN = normalize_(reference);
  for (let i = 0; i < values.length; i++) {
    if (normalize_(values[i][0]) === refN) return i + 2;
  }
  return -1;
}

/**
 * Utility: style for section headers.
 * @param {GoogleAppsScript.Spreadsheet.Range} rng
 */
function styleSectionHeader_(rng) {
  rng.setBackground(CONFIG.COLORS.teal)
    .setFontColor(CONFIG.COLORS.white)
    .setFontWeight('bold')
    .setHorizontalAlignment('left')
    .setVerticalAlignment('middle')
    .setBorder(true, true, true, true, true, true, CONFIG.COLORS.border, SpreadsheetApp.BorderStyle.SOLID);
}

/**
 * Utility: range-in-button checker.
 * @param {number} row
 * @param {number} col
 * @param {{rowStart:number,rowEnd:number,colStart:number,colEnd:number}} btn
 * @returns {boolean}
 */
function isInsideButton_(row, col, btn) {
  return row >= btn.rowStart && row <= btn.rowEnd && col >= btn.colStart && col <= btn.colEnd;
}

/**
 * Utility: get or create sheet.
 * @param {string} name
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getOrCreateSheet_(name) {
  const ss = SpreadsheetApp.getActive();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

/**
 * Utility: normalize text.
 * @param {*} value
 * @returns {string}
 */
function normalize_(value) {
  return String(value == null ? '' : value).trim();
}

/**
 * Utility: toast messages.
 * @param {string} msg
 * @param {string} title
 */
function toast_(msg, title) {
  SpreadsheetApp.getActive().toast(msg, title || 'Info', 5);
}
