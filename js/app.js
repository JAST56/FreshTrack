// Datos de simulación para el demo
let foodInventory = [
    {
        id: 1,
        type: 'pollo',
        name: 'Pechuga de Pollo',
        quantity: '2.5 kg',
        manufacturingDate: '2025-03-10',
        entryDate: '2025-03-15',
        expirationDate: '2025-03-22',
        status: 'warning' // Puede ser: ok, warning, danger
    },
    {
        id: 2,
        type: 'carne',
        name: 'Carne de Res',
        quantity: '1.2 kg',
        manufacturingDate: '2025-03-08',
        entryDate: '2025-03-12',
        expirationDate: '2025-03-25',
        status: 'ok'
    },
    {
        id: 3,
        type: 'pescado',
        name: 'Salmón',
        quantity: '0.8 kg',
        manufacturingDate: '2025-03-14',
        entryDate: '2025-03-16',
        expirationDate: '2025-03-19',
        status: 'danger'
    },
    {
        id: 4,
        type: 'lacteos',
        name: 'Queso Fresco',
        quantity: '0.5 kg',
        manufacturingDate: '2025-03-12',
        entryDate: '2025-03-14',
        expirationDate: '2025-03-28',
        status: 'ok'
    }
];

// Configuración de días de vencimiento por tipo de alimento (a temperatura ideal)
const expirationConfig = {
    pollo: 7, // 7 días desde la fecha de entrada
    carne: 14, // 14 días desde la fecha de entrada
    pescado: 3, // 3 días desde la fecha de entrada
    lacteos: 14, // 14 días desde la fecha de entrada
    frutas: 7, // 7 días desde la fecha de entrada
    verduras: 5 // 5 días desde la fecha de entrada
};

// Temperatura actual (simulada)
let currentTemp = 4; // en grados Celsius
let currentHumidity = 65; // porcentaje

// Función para calcular fecha de vencimiento
function calculateExpirationDate(foodType, manufacturingDate, entryDate, temperature) {
    // Ajusta los días de vencimiento según la temperatura
    // Si la temperatura es mayor a 5°C, se reduce el tiempo de vida útil
    let tempFactor = 1;
    if (temperature > 5) {
        tempFactor = 0.7; // Reduce un 30% la vida útil
    } else if (temperature > 8) {
        tempFactor = 0.5; // Reduce un 50% la vida útil
    }
    
    const baseDays = expirationConfig[foodType] || 7; // Valor predeterminado: 7 días
    const adjustedDays = Math.floor(baseDays * tempFactor);
    
    const entryDateTime = new Date(entryDate);
    const expirationDateTime = new Date(entryDateTime);
    expirationDateTime.setDate(entryDateTime.getDate() + adjustedDays);
    
    return expirationDateTime.toISOString().split('T')[0]; // Formato YYYY-MM-DD
}

// Función para determinar el estado del alimento
function determineStatus(expirationDate) {
    const today = new Date();
    const expiration = new Date(expirationDate);
    const diffTime = expiration - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
        return 'danger'; // Vencido
    } else if (diffDays <= 2) {
        return 'warning'; // Próximo a vencer
    } else {
        return 'ok'; // En buen estado
    }
}

// Función para actualizar la interfaz de usuario
function updateUI() {
    updateInventoryTable();
    updateNotifications();
    updateSensorData();
}

// Función para actualizar la tabla de inventario
function updateInventoryTable() {
    const tableBody = document.querySelector('#food-inventory tbody');
    tableBody.innerHTML = '';
    
    // Ordenar por proximidad a vencimiento
    const sortedInventory = [...foodInventory].sort((a, b) => {
        const dateA = new Date(a.expirationDate);
        const dateB = new Date(b.expirationDate);
        return dateA - dateB;
    });
    
    sortedInventory.forEach(item => {
        const row = document.createElement('tr');
        
        const statusText = item.status === 'ok' ? 'Buen estado' : 
                          item.status === 'warning' ? 'Próximo a vencer' : 'Vencido/Crítico';
        
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${formatDate(item.manufacturingDate)}</td>
            <td>${formatDate(item.entryDate)}</td>
            <td>${formatDate(item.expirationDate)}</td>
            <td>
                <div class="status-text">
                    <span class="status-dot status-${item.status}"></span>
                    ${statusText}
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Función para formatear fechas
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// Función para actualizar notificaciones
function updateNotifications() {
    const notificationCount = document.querySelector('.notification-count');
    const notificationList = document.querySelector('#notification-list');
    
    // Filtrar alimentos vencidos o próximos a vencer
    const alerts = foodInventory.filter(item => item.status === 'warning' || item.status === 'danger');
    
    // Actualizar contador de notificaciones
    notificationCount.textContent = alerts.length;
    
    // Limpiar lista de notificaciones
    notificationList.innerHTML = '';
    
    // Agregar notificaciones a la lista
    if (alerts.length === 0) {
        notificationList.innerHTML = '<div class="notification-item">No hay alertas de vencimiento.</div>';
    } else {
        alerts.forEach(item => {
            const alertItem = document.createElement('div');
            alertItem.classList.add('notification-item');
            alertItem.classList.add(item.status);
            
            alertItem.innerHTML = `
                <p><strong>${item.name}</strong> - ${item.quantity}</p>
                <p>Vence: ${formatDate(item.expirationDate)}</p>
            `;
            
            notificationList.appendChild(alertItem);
        });
    }
}

// Función para actualizar datos de sensores
function updateSensorData() {
    document.getElementById('temperature').textContent = `${currentTemp} °C`;
    document.getElementById('humidity').textContent = `${currentHumidity} %`;
}

// Simular cambios en la temperatura (para demo)
function simulateTempChanges() {
    setInterval(() => {
        // Pequeña variación en la temperatura (±0.5°C)
        const variation = (Math.random() - 0.5) * 0.5;
        currentTemp = parseFloat((currentTemp + variation).toFixed(1));
        
        // Pequeña variación en la humedad (±1%)
        const humidityVariation = (Math.random() - 0.5) * 2;
        currentHumidity = Math.round(currentHumidity + humidityVariation);
        
        // Mantener humedad en rango válido
        if (currentHumidity < 50) currentHumidity = 50;
        if (currentHumidity > 80) currentHumidity = 80;
        
        updateSensorData();
        
        // Actualizar estado de alimentos basado en la temperatura
        updateFoodStatus();
    }, 5000); // Cada 5 segundos
}

// Actualizar estado de alimentos basado en la temperatura actual
function updateFoodStatus() {
    foodInventory.forEach(item => {
        // Recalcular fecha de vencimiento considerando la temperatura actual
        const newExpirationDate = calculateExpirationDate(
            item.type, 
            item.manufacturingDate, 
            item.entryDate, 
            currentTemp
        );
        
        item.expirationDate = newExpirationDate;
        item.status = determineStatus(newExpirationDate);
    });
    
    updateUI();
}

// Manejar el formulario de nuevo producto
document.getElementById('new-product-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const foodType = document.getElementById('food-type').value;
    const quantity = document.getElementById('quantity').value;
    const manufacturingDate = document.getElementById('manufacturing-date').value;
    
    // Obtener nombre del alimento basado en el tipo
    const foodNames = {
        pollo: 'Pechuga de Pollo',
        carne: 'Carne de Res',
        pescado: 'Pescado',
        lacteos: 'Productos Lácteos',
        frutas: 'Frutas',
        verduras: 'Verduras'
    };
    
    // Fecha actual como fecha de entrada
    const today = new Date().toISOString().split('T')[0];
    
    // Calcular fecha de vencimiento
    const expirationDate = calculateExpirationDate(foodType, manufacturingDate, today, currentTemp);
    
    // Crear nuevo producto y agregarlo al inventario
    const newItem = {
        id: foodInventory.length + 1,
        type: foodType,
        name: foodNames[foodType],
        quantity: `${quantity} kg`,
        manufacturingDate: manufacturingDate,
        entryDate: today,
        expirationDate: expirationDate,
        status: determineStatus(expirationDate)
    };
    
    // Agregar al inventario
    foodInventory.push(newItem);
    
    // Actualizar UI
    updateUI();
    
    // Resetear formulario
    this.reset();
    
    // Mostrar mensaje de éxito
    alert('Producto agregado correctamente');
});

// Controlar la visualización del panel de notificaciones
document.querySelector('.bell-icon').addEventListener('click', function() {
    const panel = document.querySelector('.notification-panel');
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
});

// Cerrar panel de notificaciones al hacer clic fuera de él
document.addEventListener('click', function(event) {
    const bell = document.querySelector('.bell-icon');
    const panel = document.querySelector('.notification-panel');
    
    if (!bell.contains(event.target) && !panel.contains(event.target)) {
        panel.style.display = 'none';
    }
});

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    updateUI();
    simulateTempChanges();
});