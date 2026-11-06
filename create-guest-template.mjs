import fs from 'node:fs/promises';
import { join } from 'node:path';
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool';

const outputPath = join(process.cwd(), 'public', 'template-daftar-tamu.xlsx');
const workbook = Workbook.create();
const sheet = workbook.worksheets.add('Daftar Tamu');
const categories = workbook.worksheets.add('Kategori');
const font = 'Arial';
const dark = '#7B2F55';
const accent = '#C8799A';
const soft = '#FFF5F8';
const line = '#E7C4D2';

sheet.showGridLines = false;
sheet.tabColor = dark;
sheet.mergeCells('A1:B1');
sheet.getRange('A1').values = [['Template Daftar Tamu']];
sheet.getRange('A1:B1').format = {
  fill: dark,
  font: { name: font, size: 16, bold: true, color: '#FFFFFF' },
  horizontalAlignment: 'left',
  verticalAlignment: 'center',
};
sheet.getRange('A1:B1').format.rowHeight = 32;
sheet.mergeCells('A3:B3');
sheet.getRange('A3').values = [['Isi nama tamu dan pilih kategori dari daftar. Tambahkan kategori baru di sheet Kategori bila diperlukan. Jangan ubah judul kolom.']];
sheet.getRange('A3:B3').format = {
  font: { name: font, size: 10, italic: true, color: '#6D5260' },
  fill: soft,
  horizontalAlignment: 'left',
  verticalAlignment: 'center',
  wrapText: true,
  borders: { preset: 'outside', style: 'thin', color: line },
};
sheet.getRange('A3:B3').format.rowHeight = 34;
sheet.getRange('A5:B5').values = [['Nama', 'Kategori']];
sheet.getRange('A5:B5').format = {
  fill: accent,
  font: { name: font, size: 10, bold: true, color: '#FFFFFF' },
  horizontalAlignment: 'center',
  verticalAlignment: 'center',
  borders: { preset: 'all', style: 'thin', color: '#FFFFFF' },
};
sheet.getRange('A5:B5').format.rowHeight = 24;
sheet.getRange('A6:B505').format = {
  fill: '#FFFFFF',
  font: { name: font, size: 10, color: '#2F2630' },
  verticalAlignment: 'center',
  borders: { preset: 'all', style: 'thin', color: '#F3E4EA' },
};
sheet.getRange('A6:B505').format.rowHeight = 20;
sheet.getRange('A1:A505').format.columnWidth = 36;
sheet.getRange('B1:B505').format.columnWidth = 22;
sheet.getRange('B6:B505').dataValidation = { rule: { type: 'list', formula1: 'Kategori!$A$2:$A$100' } };
sheet.freezePanes.freezeRows(5);

categories.showGridLines = false;
categories.tabColor = '#DAB0C2';
categories.getRange('A1').values = [['Kategori']];
categories.getRange('A2:A5').values = [['Family'], ['Friend'], ['Colleague'], ['Other']];
categories.getRange('B1').values = [['Tambah kategori baru pada kolom A (baris 6–100).']];
categories.getRange('A1').format = { fill: dark, font: { name: font, size: 10, bold: true, color: '#FFFFFF' }, horizontalAlignment: 'center' };
categories.getRange('A2:A5').format = { font: { name: font, size: 10, color: '#2F2630' }, fill: soft, borders: { preset: 'all', style: 'thin', color: line } };
categories.getRange('B1').format = { font: { name: font, size: 9, italic: true, color: '#6D5260' } };
categories.getRange('A1:A5').format.columnWidth = 20;

workbook.recalculate();
const check = await workbook.inspect({ kind: 'table', range: 'Daftar Tamu!A1:B8', include: 'values,formulas', tableMaxRows: 8, tableMaxCols: 2 });
console.log(check.ndjson);
const errors = await workbook.inspect({ kind: 'match', searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!', options: { useRegex: true, maxResults: 30 }, summary: 'formula error scan' });
console.log(errors.ndjson);
const preview = await workbook.render({ sheetName: 'Daftar Tamu', range: 'A1:B18', scale: 2, format: 'png' });
await fs.writeFile(new URL('./template-daftar-tamu-preview.png', import.meta.url), new Uint8Array(await preview.arrayBuffer()));
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
