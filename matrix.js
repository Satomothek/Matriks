// Fungsi untuk membuat/mengatur tabel input matriks dinamis
function createMatrixTable(matrixId, rows=2, cols=2) {
    const table = document.getElementById('matrix'+matrixId);
    table.innerHTML = '';
    for (let i = 0; i < rows; i++) {
        const tr = document.createElement('tr');
        for (let j = 0; j < cols; j++) {
            const td = document.createElement('td');
            const input = document.createElement('input');
            input.type = "number";
            input.value = "0";
            input.step = "any";
            td.appendChild(input);
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
}

// Fungsi untuk mendapatkan nilai dari tabel matriks
function readMatrixTable(matrixId) {
    const table = document.getElementById('matrix'+matrixId);
    const arr = [];
    for (let i = 0; i < table.rows.length; i++) {
        const row = [];
        for (let j = 0; j < table.rows[i].cells.length; j++) {
            const val = parseFloat(table.rows[i].cells[j].firstChild.value) || 0;
            row.push(val);
        }
        arr.push(row);
    }
    return arr;
}

// Resize fungsi
function resizeTable(matrixId, action) {
    const table = document.getElementById('matrix'+matrixId);
    let rows = table.rows.length;
    let cols = rows > 0 ? table.rows[0].cells.length : 0;

    if (rows === 0 || cols === 0) {
        createMatrixTable(matrixId, 2, 2);
        return;
    }

    if (action === 'addRow') {
        const tr = document.createElement('tr');
        for (let j = 0; j < cols; j++) {
            const td = document.createElement('td');
            const input = document.createElement('input');
            input.type = "number";
            input.value = "0";
            input.step = "any";
            td.appendChild(input);
            tr.appendChild(td);
        }
        table.appendChild(tr);
    } else if (action === 'removeRow' && rows > 1) {
        table.deleteRow(rows-1);
    } else if (action === 'addCol') {
        for (let i = 0; i < rows; i++) {
            const td = document.createElement('td');
            const input = document.createElement('input');
            input.type = "number";
            input.value = "0";
            input.step = "any";
            td.appendChild(input);
            table.rows[i].appendChild(td);
        }
    } else if (action === 'removeCol' && cols > 1) {
        for (let i = 0; i < rows; i++) {
            table.rows[i].deleteCell(cols-1);
        }
    }
}

// Format matriks ke string
function formatMatrix(matrix) {
    if (typeof matrix === "string") return matrix;
    if (!Array.isArray(matrix)) return toFraction(matrix);
    return matrix.map(row => row.map(val => toFraction(val)).join('\t')).join('\n');
}

function formatMatrixPretty(matrix) {
    // Format matrix as pretty rows for display, rata kanan
    if (!Array.isArray(matrix)) return toFraction(matrix);
    // Hitung lebar maksimum tiap kolom
    const n = matrix.length;
    const m = matrix[0].length;
    const colWidths = [];
    for (let j = 0; j < m; j++) {
        let maxLen = 0;
        for (let i = 0; i < n; i++) {
            let s = toFraction(matrix[i][j]);
            if (s.length > maxLen) maxLen = s.length;
        }
        colWidths[j] = maxLen;
    }
    return matrix.map(row =>
        '( ' +
        row.map((val, j) => toFraction(val).padStart(colWidths[j], ' ')).join('\t') +
        ' )'
    ).join('\n');
}

function formatInverseResult(inputMatrix, inverseMatrix) {
    return formatMatrixPretty(inputMatrix) + '\n\n^(-1) =\n\n' + formatMatrixPretty(inverseMatrix);
}

function formatDeterminantResult(inputMatrix, detValue) {
    return (
        'det\n' +
        formatMatrixPretty(inputMatrix) +
        '\n= ' + toFraction(detValue)
    );
}

// Operasi matriks
const Matrix = {
    add(a, b) {
        if (a.length !== b.length || a[0].length !== b[0].length)
            throw "Ukuran matriks tidak sama";
        return a.map((row, i) => row.map((val, j) => val + b[i][j]));
    },
    subtract(a, b) {
        if (a.length !== b.length || a[0].length !== b[0].length)
            throw "Ukuran matriks tidak sama";
        return a.map((row, i) => row.map((val, j) => val - b[i][j]));
    },
    multiply(a, b) {
        if (a[0].length !== b.length)
            throw "Jumlah kolom A harus sama dengan jumlah baris B";
        let result = Array(a.length).fill().map(() => Array(b[0].length).fill(0));
        for (let i = 0; i < a.length; i++)
            for (let j = 0; j < b[0].length; j++)
                for (let k = 0; k < a[0].length; k++)
                    result[i][j] += a[i][k] * b[k][j];
        return result;
    },
    transpose(a) {
        return a[0].map((_, i) => a.map(row => row[i]));
    },
    determinant(a) {
        if (a.length !== a[0].length) throw "Matriks harus persegi";
        const n = a.length;
        if (n === 1) return a[0][0];
        if (n === 2) return a[0][0]*a[1][1] - a[0][1]*a[1][0];
        let det = 0;
        for (let j = 0; j < n; j++) {
            det += ((j%2===0?1:-1)*a[0][j]*Matrix.determinant(Matrix.minor(a,0,j)));
        }
        return det;
    },
    minor(a, row, col) {
        return a.filter((_, i) => i !== row)
                .map(r => r.filter((_, j) => j !== col));
    },
    cofactorMatrix(a) {
        const n = a.length;
        return a.map((row,i)=>row.map((_,j)=>{
            let minor = Matrix.minor(a, i, j);
            return ((i+j)%2===0?1:-1) * Matrix.determinant(minor);
        }));
    },
    adjoint(a) {
        return Matrix.transpose(Matrix.cofactorMatrix(a));
    },
    inverse(a) {
        const det = Matrix.determinant(a);
        if (det === 0) throw "Matriks tidak memiliki invers (determinan = 0)";
        const adj = Matrix.adjoint(a);
        return adj.map(row => row.map(x => x/det));
    },
    scalarMultiply(matrix, scalar) {
        return matrix.map(row => row.map(val => val * scalar));
    }
};

function toFraction(x, tolerance = 1.0E-10) {
    if (!isFinite(x) || isNaN(x)) return "-";
    if (Number.isInteger(x)) return x.toString();
    let h1=1, h2=0, k1=0, k2=1, b = Math.abs(x);
    let sign = x < 0 ? -1 : 1;
    do {
        let a = Math.floor(b);
        let aux = h1; h1 = a*h1 + h2; h2 = aux;
        aux = k1; k1 = a*k1 + k2; k2 = aux;
        b = 1/(b - a);
    } while (Math.abs(x - sign*h1/k1) > Math.abs(x) * tolerance && k1 <= 10000);

    if (k1 === 0) return "-";
    if (!isFinite(h1) || !isFinite(k1)) return "-";
    if (h1 === 0) return "0";
    return (sign < 0 ? "-" : "") + h1 + "/" + k1;
}

// Gauss-Jordan untuk invers
function gaussJordanInverse(a, logSteps) {
    const n = a.length;
    if (n !== a[0].length) throw "Matriks harus persegi";
    let m = a.map(row => row.slice());
    let inv = Array.from({length: n}, (_, i) =>
        Array.from({length: n}, (_, j) => (i === j ? 1 : 0))
    );
    if (logSteps) logSteps.push("Awal:\n" + formatAugmentedMatrix(m, inv));
    for (let i = 0; i < n; i++) {
        let maxRow = i;
        for (let k = i+1; k < n; k++) {
            if (Math.abs(m[k][i]) > Math.abs(m[maxRow][i])) maxRow = k;
        }
        if (m[maxRow][i] === 0) throw "Matriks tidak memiliki invers (pivot 0)";
        [m[i], m[maxRow]] = [m[maxRow], m[i]];
        [inv[i], inv[maxRow]] = [inv[maxRow], inv[i]];
        if (logSteps) logSteps.push(`Tukar baris ${i+1} dengan baris ${maxRow+1}:\n` + formatAugmentedMatrix(m, inv));
        let pivot = m[i][i];
        for (let j = 0; j < n; j++) {
            m[i][j] /= pivot;
            inv[i][j] /= pivot;
        }
        if (logSteps) logSteps.push(`Bagi baris ${i+1} dengan pivot ${toFraction(pivot)}:\n` + formatAugmentedMatrix(m, inv));
        for (let k = 0; k < n; k++) {
            if (k === i) continue;
            let factor = m[k][i];
            for (let j = 0; j < n; j++) {
                m[k][j] -= factor * m[i][j];
                inv[k][j] -= factor * inv[i][j];
            }
            if (logSteps) logSteps.push(`Eliminasi baris ${k+1} dengan faktor ${toFraction(factor)}:\n` + formatAugmentedMatrix(m, inv));
        }
    }
    if (logSteps) logSteps.push("Matriks identitas tercapai, invers:\n" + formatAugmentedMatrix(m, inv));
    return inv;
}

function bareissInverse(a, logSteps) {
    const n = a.length;
    if (n !== a[0].length) throw "Matriks harus persegi";
    let m = a.map((row, i) => [...row, ...Array.from({length: n}, (_, j) => i === j ? 1 : 0)]);
    let prevPivot = 1;
    if (logSteps) logSteps.push("Awal (augmented):\n" + formatMatrix(m));
    for (let k = 0; k < n; k++) {
        let pivot = m[k][k];
        if (pivot === 0) throw "Matriks tidak memiliki invers (pivot 0)";
        if (logSteps) logSteps.push(`Pivot ke-${k+1}: ${toFraction(pivot)}`);
        for (let i = 0; i < n; i++) {
            if (i === k) continue;
            let factor = m[i][k];
            for (let j = 0; j < 2*n; j++) {
                m[i][j] = (pivot * m[i][j] - factor * m[k][j]) / prevPivot;
            }
        }
        prevPivot = pivot;
        if (logSteps) logSteps.push(`Setelah eliminasi kolom ${k+1}:\n` + formatMatrix(m));
    }
    for (let i = 0; i < n; i++) {
        let factor = m[i][i];
        for (let j = 0; j < 2*n; j++) {
            m[i][j] /= factor;
        }
    }
    if (logSteps) logSteps.push("Normalisasi diagonal:\n" + formatMatrix(m));
    let inv = m.map(row => row.slice(n));
    if (logSteps) logSteps.push("Ambil bagian kanan sebagai invers:\n" + formatAugmentedMatrix(m.map(row => row.slice(0, n)), inv));
    return inv;
}

// Tambahkan fungsi untuk memformat proses minor dan cofactor
function formatMinorProcess(matrix, i, j) {
    const minor = Matrix.minor(matrix, i, j);
    const sign = ((i + j) % 2 === 0) ? 1 : -1;
    const detMinor = Matrix.determinant(minor);
    let formula = `Minor (${i+1},${j+1}):\n${formatMatrixPretty(minor)}\n`;
    formula += `Cofactor (${i+1},${j+1}) = (${sign === 1 ? "+" : "-"}1) * det(minor) = (${sign === 1 ? "+" : "-"}1) * ${detMinor} = ${sign * detMinor}`;
    return formula;
}

function formatCofactorProcess(matrix) {
    const n = matrix.length;
    let steps = [];
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            steps.push(formatMinorProcess(matrix, i, j));
        }
    }
    return steps.join('\n\n');
}

function formatAdjugateProcess(matrix) {
    const cofactor = Matrix.cofactorMatrix(matrix);
    let s = "Matriks Cofactor:\n" + formatMatrixPretty(cofactor) + "\n\n";
    s += "Transpose (Adjugate):\n" + formatMatrixPretty(Matrix.transpose(cofactor));
    return s;
}

function formatAdjugateDivision(adj, det) {
    // Tampilkan setiap elemen adjugate dibagi determinan dalam bentuk pembagian, misal: -7/3
    return adj.map(row =>
        '( ' + row.map(val => {
            // Jika hasil bagi bulat, tampilkan bulat, jika tidak tampilkan pembagian
            if (val % det === 0) {
                return (val / det).toString();
            } else {
                // Sederhanakan pecahan
                function gcd(a, b) {
                    return b === 0 ? a : gcd(b, a % b);
                }
                let n = Math.round(val), d = Math.round(det);
                let sign = (n * d < 0) ? -1 : 1;
                n = Math.abs(n);
                d = Math.abs(d);
                let factor = gcd(n, d);
                n = n / factor;
                d = d / factor;
                let frac = (sign < 0 ? '-' : '') + n + '/' + d;
                return frac;
            }
        }).join('\t') + ' )'
    ).join('\n');
}

function simplifyFraction(num, denom) {
    function gcd(a, b) {
        return b === 0 ? a : gcd(b, a % b);
    }
    let n = Math.round(num), d = Math.round(denom);
    let sign = (n * d < 0) ? -1 : 1;
    n = Math.abs(n);
    d = Math.abs(d);
    let factor = gcd(n, d);
    n = n / factor;
    d = d / factor;
    if (d === 1) return (sign < 0 ? '-' : '') + n;
    return (sign < 0 ? '-' : '') + n + '/' + d;
}

function formatMatrixPrettyFraction(matrix) {
    // Format matrix as pretty rows for display, menyederhanakan pecahan dan rata kanan
    if (!Array.isArray(matrix)) return toFraction(matrix);
    const n = matrix.length;
    const m = matrix[0].length;
    const colWidths = [];
    for (let j = 0; j < m; j++) {
        let maxLen = 0;
        for (let i = 0; i < n; i++) {
            let s = matrix[i][j].toString();
            if (s.length > maxLen) maxLen = s.length;
        }
        colWidths[j] = maxLen;
    }
    return matrix.map(row =>
        '( ' +
        row.map((val, j) => val.toString().padStart(colWidths[j], ' ')).join('\t') +
        ' )'
    ).join('\n');
}

// Invers matriks dengan metode yang dipilih
Matrix.inverse = function(a, method = "adjugate", logSteps) {
    switch (method) {
        case "adjugate":
            const det = Matrix.determinant(a);
            if (det === 0) throw "Matriks tidak memiliki invers (determinan = 0)";
            const cofactor = Matrix.cofactorMatrix(a);
            const adj = Matrix.transpose(cofactor);
            if (logSteps) {
                logSteps.push("Determinan: " + det);
                logSteps.push("Langkah Minor dan Cofactor:\n" + formatCofactorProcess(a));
                logSteps.push("Matriks Cofactor:\n" + formatMatrixPretty(cofactor) + "\n\nTranspose (Adjugate):\n" + formatMatrixPretty(adj));
                logSteps.push(`Invers = (1/det) * adjugate, det = ${det}`);
                // Hasil akhir invers dalam bentuk pecahan sederhana
                let inverseFinal = adj.map(row => row.map(x => simplifyFraction(x, det)));
                logSteps.push("Hasil akhir invers:\n" + formatMatrixPrettyFraction(inverseFinal));
            }
            // Return hasil akhir invers dalam bentuk angka (bukan string pecahan)
            return adj.map(row => row.map(x => x/det));
        case "gaussjordan":
            return gaussJordanInverse(a, logSteps);
        case "bareiss":
            return bareissInverse(a, logSteps);
        default:
            throw "Metode invers tidak dikenali";
    }
};

// Fungsi utama untuk handle tombol
function calculate(op) {
    const matA = readMatrixTable('A');
    const matB = readMatrixTable('B');
    let result = "";
    let detailsHTML = "";
    let showDetails = false;
    const scalar = parseFloat(document.getElementById('scalarInput')?.value || 1);
    try {
        switch(op) {
            case 'add':
                result = formatMatrixPretty(Matrix.add(matA, matB));
                break;
            case 'subtract':
                result = formatMatrixPretty(Matrix.subtract(matA, matB));
                break;
            case 'multiply':
                result = formatMatrixPretty(Matrix.multiply(matA, matB));
                break;
            case 'transposeA':
                result = formatMatrixPretty(Matrix.transpose(matA));
                break;
            case 'transposeB':
                result = formatMatrixPretty(Matrix.transpose(matB));
                break;
            case 'detA':
                result = formatDeterminantResult(matA, Matrix.determinant(matA));
                detailsHTML = buildDeterminantDetailsHTML_Sarrus(matA, Matrix.determinant(matA));
                showDetails = true;
                break;
            case 'detB':
                result = formatDeterminantResult(matB, Matrix.determinant(matB));
                detailsHTML = buildDeterminantDetailsHTML_Sarrus(matB, Matrix.determinant(matB));
                showDetails = true;
                break;
            case 'adjA': {
                // Tampilkan proses adjoint matriks A
                const adjA = Matrix.adjoint(matA);
                const logAdjoint = formatAdjointSteps(matA);
                result = formatMatrixPretty(adjA);
                detailsHTML = `<details>
<summary>Adjugate Matrix</summary>
<pre>${logAdjoint}</pre>
</details>`;
                showDetails = true;
                break;
            }
            case 'adjB': {
                // Tampilkan proses adjoint matriks B
                const adjB = Matrix.adjoint(matB);
                const logAdjoint = formatAdjointSteps(matB);
                result = formatMatrixPretty(adjB);
                detailsHTML = `<details>
<summary>Adjugate Matrix</summary>
<pre>${logAdjoint}</pre>
</details>`;
                showDetails = true;
                break;
            }
            case 'invA': {
                // Proses inverse dengan tiga metode
                let logGauss = [], logAdj = [], logBareiss = [];
                let invGauss, invAdj, invBareiss;
                let errorGauss = "", errorAdj = "", errorBareiss = "";
                // Bareiss
                try {
                    invBareiss = bareissInverse(matA, logBareiss);
                } catch (e) {
                    errorBareiss = e.toString();
                }
                // Adjugate
                try {
                    invAdj = Matrix.inverse(matA, "adjugate", logAdj);
                } catch (e) {
                    errorAdj = e.toString();
                }
                // Gauss-Jordan (DIPAKAI SEBAGAI HASIL UTAMA)
                try {
                    invGauss = gaussJordanInverse(matA, logGauss);
                } catch (e) {
                    errorGauss = e.toString();
                }
                showDetails = true;
                // Hasil utama (pakai Gauss-Jordan jika tidak error, jika error pakai Adjugate, dst)
                if (!errorGauss) {
                    result = formatInverseResult(matA, invGauss);
                } else if (!errorAdj) {
                    result = formatInverseResult(matA, invAdj);
                } else if (!errorBareiss) {
                    result = formatInverseResult(matA, invBareiss);
                } else {
                    result = "Error: Matriks tidak memiliki invers";
                }
                // Details HTML: pakai <details>
                detailsHTML = buildDetailsHTML(
                    errorBareiss, invBareiss, logBareiss,
                    errorGauss, invGauss, logGauss,
                    errorAdj, invAdj, logAdj
                );
                break;
            }
            case 'invB': {
                let logGauss = [], logAdj = [], logBareiss = [];
                let invGauss, invAdj, invBareiss;
                let errorGauss = "", errorAdj = "", errorBareiss = "";
                // Bareiss
                try {
                    invBareiss = bareissInverse(matB, logBareiss);
                } catch (e) {
                    errorBareiss = e.toString();
                }
                // Adjugate
                try {
                    invAdj = Matrix.inverse(matB, "adjugate", logAdj);
                } catch (e) {
                    errorAdj = e.toString();
                }
                // Gauss-Jordan (DIPAKAI SEBAGAI HASIL UTAMA)
                try {
                    invGauss = gaussJordanInverse(matB, logGauss);
                } catch (e) {
                    errorGauss = e.toString();
                }
                showDetails = true;
                if (!errorGauss) {
                    result = formatInverseResult(matB, invGauss);
                } else if (!errorAdj) {
                    result = formatInverseResult(matB, invAdj);
                } else if (!errorBareiss) {
                    result = formatInverseResult(matB, invBareiss);
                } else {
                    result = "Error: Matriks tidak memiliki invers";
                }
                detailsHTML = buildDetailsHTML(
                    errorBareiss, invBareiss, logBareiss,
                    errorGauss, invGauss, logGauss,
                    errorAdj, invAdj, logAdj
                );
                break;
            }
            // HAPUS case 'scalarA' dan 'scalarB'
            case 'manualExpr': {
                const expr = document.getElementById('manualExpr').value.trim();
                result = calculateManualMatrixExpression(expr, matA, matB);
                break;
            }
            default:
                result = "Operasi tidak dikenali";
        }
    } catch (err) {
        result = "Error: " + err;
        showDetails = false;
    }
    document.getElementById('result').textContent = result;
const detailsElem = document.getElementById('result-details');
if (showDetails) {
    detailsElem.style.display = "";
    detailsElem.innerHTML = detailsHTML;
} else {
    detailsElem.style.display = "none";
}
}

// Inisialisasi awal
window.onload = function() {
    createMatrixTable('A', 2, 2);
    createMatrixTable('B', 2, 2);
}

function formatAugmentedMatrix(left, right) {
    // Gabungkan left dan right jadi satu array 2D
    const n = left.length;
    const m = left[0].length;
    const p = right[0].length;
    // Gabungkan per baris
    const rows = [];
    for (let i = 0; i < n; i++) {
        rows.push([...left[i], '|', ...right[i]]);
    }
    // Hitung lebar maksimum tiap kolom
    const colWidths = [];
    for (let j = 0; j < m + 1 + p; j++) {
        let maxLen = 0;
        for (let i = 0; i < n; i++) {
            let val = rows[i][j];
            if (val === '|') val = '|';
            else val = toFraction(val);
            if (val.length > maxLen) maxLen = val.length;
        }
        colWidths[j] = maxLen;
    }
    // Format tiap baris dengan padding rata kanan
    return rows.map(row =>
        '( ' +
        row.map((val, j) => {
            if (val === '|') return ' | ';
            let s = toFraction(val);
            return s.padStart(colWidths[j], ' ');
        }).join(' ') +
        ' )'
    ).join('\n');
}

function buildDetailsHTML(errorBareiss, invBareiss, logBareiss, errorGauss, invGauss, logGauss, errorAdj, invAdj, logAdj) {
    return `<details>
        <summary>Montante's method (Bareiss algorithm)</summary>
        <pre>${errorBareiss ? errorBareiss : (formatMatrix(invBareiss) + "\n\n" + logBareiss.join("\n\n"))}</pre>
    </details>
    <details>
        <summary>Gauss–Jordan elimination</summary>
        <pre>${errorGauss ? errorGauss : (formatMatrix(invGauss) + "\n\n" + logGauss.join("\n\n"))}</pre>
    </details>
    <details>
        <summary>Adjugate matrix</summary>
        <pre>${errorAdj ? errorAdj : (formatMatrix(invAdj) + "\n\n" + logAdj.join("\n\n"))}</pre>
    </details>`;
}

function buildDeterminantDetailsHTML(errorTri, detTri, logTri, errorSarrus, detSarrus, logSarrus, errorBareiss, detBareiss, logBareiss, errorGauss, detGauss, logGauss) {
    return `<details>
    <summary>Aturan Sarrus</summary>
    <pre>${errorSarrus ? errorSarrus : (toFraction(detSarrus) + "\n\n" + logSarrus.join("\n\n"))}</pre>
    </details>
    `;
}

function formatAdjointSteps(matrix) {
    let steps = [];
    // Langkah minor dan cofactor
    steps.push("Langkah Minor dan Cofactor:\n" + formatCofactorProcess(matrix));
    // Matriks cofactor
    const cofactor = Matrix.cofactorMatrix(matrix);
    steps.push("Matriks Cofactor:\n" + formatMatrixPretty(cofactor));
    // Transpose (Adjugate)
    const adj = Matrix.transpose(cofactor);
    steps.push("Transpose (Adjugate):\n" + formatMatrixPretty(adj));
    return steps.join('\n\n');
}

// Fungsi untuk menampilkan proses Sarrus pada matriks 3x3
function sarrusDeterminantSteps(matrix) {
    // matrix: array 3x3
    let m = matrix;
    let steps = [];
    // Salin dua kolom pertama ke kanan
    let ext = [
        [m[0][0], m[0][1], m[0][2], m[0][0], m[0][1]],
        [m[1][0], m[1][1], m[1][2], m[1][0], m[1][1]],
        [m[2][0], m[2][1], m[2][2], m[2][0], m[2][1]]
    ];
    steps.push("Salin dua kolom pertama ke kanan:\n" +
        ext.map(row => row.map(x => toFraction(x)).join('\t')).join('\n')
    );
    // Hitung jumlah diagonal utama
    let diag1 = m[0][0]*m[1][1]*m[2][2];
    let diag2 = m[0][1]*m[1][2]*m[2][0];
    let diag3 = m[0][2]*m[1][0]*m[2][1];
    steps.push(
        `Diagonal utama:\n` +
        `(${toFraction(m[0][0])} × ${toFraction(m[1][1])} × ${toFraction(m[2][2])}) = ${toFraction(diag1)}\n` +
        `(${toFraction(m[0][1])} × ${toFraction(m[1][2])} × ${toFraction(m[2][0])}) = ${toFraction(diag2)}\n` +
        `(${toFraction(m[0][2])} × ${toFraction(m[1][0])} × ${toFraction(m[2][1])}) = ${toFraction(diag3)}`
    );
    // Hitung jumlah diagonal anti
    let adiag1 = m[0][2]*m[1][1]*m[2][0];
    let adiag2 = m[0][0]*m[1][2]*m[2][1];
    let adiag3 = m[0][1]*m[1][0]*m[2][2];
    steps.push(
        `Diagonal anti:\n` +
        `(${toFraction(m[0][2])} × ${toFraction(m[1][1])} × ${toFraction(m[2][0])}) = ${toFraction(adiag1)}\n` +
        `(${toFraction(m[0][0])} × ${toFraction(m[1][2])} × ${toFraction(m[2][1])}) = ${toFraction(adiag2)}\n` +
        `(${toFraction(m[0][1])} × ${toFraction(m[1][0])} × ${toFraction(m[2][2])}) = ${toFraction(adiag3)}`
    );
    let sumDiag = diag1 + diag2 + diag3;
    let sumAdiag = adiag1 + adiag2 + adiag3;
    let det = sumDiag - sumAdiag;
    steps.push(
        `Jumlah diagonal utama: ${toFraction(diag1)} + ${toFraction(diag2)} + ${toFraction(diag3)} = ${toFraction(sumDiag)}\n` +
        `Jumlah diagonal anti: ${toFraction(adiag1)} + ${toFraction(adiag2)} + ${toFraction(adiag3)} = ${toFraction(sumAdiag)}\n` +
        `Determinan = Jumlah diagonal utama - Jumlah diagonal anti = ${toFraction(sumDiag)} - ${toFraction(sumAdiag)} = ${toFraction(det)}`
    );
    return steps.join('\n\n');
}

// Fungsi untuk menampilkan matriks Sarrus dengan garis diagonal
function formatSarrusMatrixWithDiagonals(matrix) {
    // matrix: 3x3
    // Buat matriks 3x5 (salin dua kolom pertama ke kanan)
    let ext = [
        [matrix[0][0], matrix[0][1], matrix[0][2], matrix[0][0], matrix[0][1]],
        [matrix[1][0], matrix[1][1], matrix[1][2], matrix[1][0], matrix[1][1]],
        [matrix[2][0], matrix[2][1], matrix[2][2], matrix[2][0], matrix[2][1]]
    ];
    // Tampilkan tanpa garis, hanya angka
    let lines = [];
    for (let i = 0; i < 3; i++) {
        let row = [];
        for (let j = 0; j < 5; j++) {
            row.push(toFraction(ext[i][j]));
        }
        lines.push(row.join('\t'));
    }
    return lines.join('\n');
}

// Fungsi untuk menampilkan detail proses aturan Sarrus
function buildDeterminantDetailsHTML_Sarrus(inputMatrix, detValue) {
    if (
        Array.isArray(inputMatrix) &&
        inputMatrix.length === 3 &&
        inputMatrix[0].length === 3
    ) {
        let proses = sarrusDeterminantSteps(inputMatrix);
        return `<details>
    <summary>Aturan Sarrus</summary>
    <pre>${proses}</pre>
</details>`;
    }
    return '';
}

function calculateManualMatrixExpression(expr, matA, matB) {
    // Mendukung ekspresi seperti: 2A+3B, -A+B, 0.5A-2B, dst
    // Hanya mendukung A dan B, + dan -, serta koefisien real
    let re = /([+-]?\s*\d*\.?\d*)\s*([AB])/gi;
    let m, coefA = 0, coefB = 0, found = false;
    while ((m = re.exec(expr)) !== null) {
        found = true;
        let coef = m[1].replace(/\s+/g, '');
        if (coef === '' || coef === '+') coef = 1;
        else if (coef === '-') coef = -1;
        else coef = parseFloat(coef);
        if (m[2] === 'A') coefA += coef;
        if (m[2] === 'B') coefB += coef;
    }
    // Jika tidak ditemukan A atau B
    if (!found) return "Ekspresi tidak valid. Gunakan format seperti 2A+3B atau -A+B";
    // Validasi ukuran matriks
    if (matA.length !== matB.length || matA[0].length !== matB[0].length)
        return "Ukuran matriks tidak sama";
    // Hitung hasil
    let result = [];
    for (let i = 0; i < matA.length; i++) {
        let row = [];
        for (let j = 0; j < matA[0].length; j++) {
            row.push(coefA * matA[i][j] + coefB * matB[i][j]);
        }
        result.push(row);
    }
    return formatMatrixPretty(result);
}
