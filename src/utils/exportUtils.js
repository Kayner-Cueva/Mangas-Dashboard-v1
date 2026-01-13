/**
 * Exporta datos a un archivo JSON
 * @param {Array} data - Los datos a exportar
 * @param {string} filename - Nombre del archivo
 */
export const exportToJSON = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

/**
 * Exporta datos a un archivo CSV
 * @param {Array} data - Los datos a exportar
 * @param {string} filename - Nombre del archivo
 */
export const exportToCSV = (data, filename) => {
    if (!data || !data.length) return

    const headers = Object.keys(data[0])
    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header] === null || row[header] === undefined ? '' : row[header]
                // Escapar comas y comillas
                const escaped = ('' + value).replace(/"/g, '""')
                return `"${escaped}"`
            }).join(',')
        )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}
