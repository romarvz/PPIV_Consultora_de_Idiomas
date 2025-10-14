export const formatDate = (dateString) => {
  if (!dateString) return '';
  // Creamos el objeto de fecha en UTC para evitar problemas de zona horaria.
  const date = new Date(dateString);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Los meses son 0-indexados
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

export const formatCurrency = (number) => {
  if (typeof number !== 'number') {
    return '0,00';
  }
  // Usamos toLocaleString con un locale que use el formato deseado (ej. 'de-DE' para Alemania)
  // para obtener la separación de miles y comas decimales.
  const formatted = number.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatted;
};
