function parseRow(row) {
    let cleanRow = {};
    for (let k in row) {
        if (k) cleanRow[k.trim()] = row[k] ? String(row[k]).trim() : '';
    }

    let vendedor = '';
    for (let key in cleanRow) {
        if (key.startsWith('Qual é o vendedor?') && cleanRow[key]) {
            vendedor = cleanRow[key];
            break;
        }
    }

    let lider = '';
    for (let key in cleanRow) {
        if (key.startsWith('Qual é o líder?') && cleanRow[key]) {
            lider = cleanRow[key];
            break;
        }
    }

    const valorNum = parseFloat(
        (cleanRow['VALOR'] || '0')
        .replace('R$', '')
        .replace(/\./g, '')
        .replace(',', '.')
        .trim()
    ) || 0;

    return {
        timestamp: cleanRow['Timestamp'] || '',
        empresa: (cleanRow['Qual empresa?'] || 'GERAL').toUpperCase(),
        lider: lider || 'NÃO INFORMADO',
        vendedor: vendedor || 'NÃO INFORMADO',
        solar: cleanRow['GERADO PELO SOLAR?'] || '',
        numSolar: cleanRow['NÚMERO DO SOLAR'] || '-',
        cliente: cleanRow['NOME COMPLETO'] || 'CLIENTE NÃO INFORMADO',
        cpf: cleanRow['CPF/CNPJ'] || '',
        cidade: cleanRow['CIDADE'] || '',
        bairro: cleanRow['BAIRRO'] || '',
        tv: cleanRow['TV'] || '',
        virtua: cleanRow['VIRTUA'] || '',
        fone: cleanRow['FONE'] || '',
        chip: cleanRow['CHIP'] || '',
        valor: valorNum
    };
}

function getFilteredData() {
    return rawData.filter(i => {
        if (currentBranch === 'TODOS') return true;
        return i.empresa.includes(currentBranch);
    });
}