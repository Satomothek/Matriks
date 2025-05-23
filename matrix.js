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
    if (!Array.isArray(matrix)) return String(matrix);
    return matrix.map(row => row.join('\t')).join('\n');
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
    }
};

// Fungsi utama untuk handle tombol
function calculate(op) {
    const matA = readMatrixTable('A');
    const matB = readMatrixTable('B');
    let result = "";
    try {
        switch(op) {
            case 'add':
                result = Matrix.add(matA, matB);
                break;
            case 'subtract':
                result = Matrix.subtract(matA, matB);
                break;
            case 'multiply':
                result = Matrix.multiply(matA, matB);
                break;
            case 'transposeA':
                result = Matrix.transpose(matA);
                break;
            case 'transposeB':
                result = Matrix.transpose(matB);
                break;
            case 'detA':
                result = Matrix.determinant(matA);
                break;
            case 'detB':
                result = Matrix.determinant(matB);
                break;
            case 'invA':
                result = Matrix.inverse(matA);
                break;
            case 'invB':
                result = Matrix.inverse(matB);
                break;
            case 'adjA':
                result = Matrix.adjoint(matA);
                break;
            case 'adjB':
                result = Matrix.adjoint(matB);
                break;
            default:
                result = "Operasi tidak dikenali";
        }
    } catch (err) {
        result = "Error: " + err;
    }
    document.getElementById('result').textContent = formatMatrix(result);
}

// Inisialisasi awal
window.onload = function() {
    createMatrixTable('A', 2, 2);
    createMatrixTable('B', 2, 2);
}
