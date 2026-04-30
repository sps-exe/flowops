export function exportToCSV(data, filename) {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(item =>
    headers.map(header => `"${(item[header] || '').toString().replace(/"/g, '""')}"`).join(',')
  );
  const csvString = [headers.join(','), ...rows].join('\n');
  
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function parseCSV(csvString) {
  const lines = csvString.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  const results = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
    const item = {};
    headers.forEach((header, index) => {
      let val = values[index];
      // Type safety for numbers
      if (!isNaN(val) && val !== '') {
        val = Number(val);
      }
      item[header] = val;
    });
    // Ensure an ID exists or generate a fast one
    if (!item.id) {
        item.id = Math.floor(Math.random() * 10000);
    }
    results.push(item);
  }
  return results;
}
