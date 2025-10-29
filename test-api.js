const BASE_URL = 'http://localhost:4008';

// Variables globales para almacenar datos entre pruebas
let authCookie = '';
let siteId = null;
let userId = null;
let customerId = null;
let debtId = null;

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, colors.blue);
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green);
}

function logError(message) {
  log(`✗ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ ${message}`, colors.yellow);
}

// Función auxiliar para hacer peticiones
async function makeRequest(method, endpoint, data = null, includeCookie = false) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (includeCookie && authCookie) {
    options.headers['Cookie'] = authCookie;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  logInfo(`${method} ${endpoint}`);

  try {
    const response = await fetch(url, options);

    // Capturar cookies de la respuesta
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      authCookie = setCookie.split(';')[0];
    }

    const responseData = await response.json();

    if (response.ok) {
      logSuccess(`Status: ${response.status}`);
      console.log('Response:', JSON.stringify(responseData, null, 2));
      return { success: true, data: responseData };
    } else {
      logError(`Status: ${response.status}`);
      console.log('Error:', JSON.stringify(responseData, null, 2));
      return { success: false, data: responseData };
    }
  } catch (error) {
    logError(`Request failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// 1. Crear Site
async function testCreateSite() {
  logSection('1. CREAR SITE');

  const siteData = {
    name: 'Sucursal Central Test',
    status: 'ACTIVE',
    stellarPublicKey: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    stellarSecretKey: 'SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
  };

  const result = await makeRequest('POST', '/sites', siteData);

  if (result.success && result.data.data && result.data.data.id) {
    siteId = result.data.data.id;
    logSuccess(`Site creado con ID: ${siteId}`);
  }

  return result.success;
}

// 2. Crear Usuario
async function testCreateUser() {
  logSection('2. CREAR USUARIO');

  if (!siteId) {
    logError('No hay siteId disponible. Ejecuta testCreateSite primero.');
    return false;
  }

  const userData = {
    siteId: siteId,
    email: 'admin@test.com',
    name: 'Admin',
    lastName: 'Test',
    password: 'Password123',
    phoneNumber: '+5215512345678',
    role: 'MANAGER',
    status: 'ACTIVE'
  };

  const result = await makeRequest('POST', '/users', userData);

  if (result.success && result.data.data && result.data.data.id) {
    userId = result.data.data.id;
    logSuccess(`Usuario creado con ID: ${userId}`);
  }

  return result.success;
}

// 3. Login
async function testLogin() {
  logSection('3. LOGIN');

  const loginData = {
    email: 'admin@test.com',
    password: 'Password123'
  };

  const result = await makeRequest('POST', '/auth/login', loginData);

  if (result.success) {
    logSuccess('Login exitoso');
    logInfo(`Cookie guardada: ${authCookie}`);
  }

  return result.success;
}

// 4. Validar Sesión
async function testValidateSession() {
  logSection('4. VALIDAR SESIÓN');

  const result = await makeRequest('GET', '/auth/validate', null, true);

  if (result.success) {
    logSuccess('Sesión válida');
  }

  return result.success;
}

// 5. Crear Customer
async function testCreateCustomer() {
  logSection('5. CREAR CLIENTE');

  if (!siteId) {
    logError('No hay siteId disponible.');
    return false;
  }

  const customerData = {
    siteId: siteId,
    name: 'Juan Pérez',
    phoneNumber: '+5215587654321',
    email: 'juan.perez@test.com',
    birthDate: '1990-05-15',
    gender: 'MALE',
    address: 'Calle Principal 123, Col. Centro',
    zipCode: '06000',
    notes: 'Cliente frecuente',
    status: 'ACTIVE'
  };

  const result = await makeRequest('POST', '/customers', customerData, true);

  if (result.success && result.data.data && result.data.data.id) {
    customerId = result.data.data.id;
    logSuccess(`Cliente creado con ID: ${customerId}`);
  }

  return result.success;
}

// 6. Obtener todos los clientes
async function testGetCustomers() {
  logSection('6. OBTENER TODOS LOS CLIENTES');

  const result = await makeRequest('GET', '/customers', null, true);

  if (result.success && result.data.data) {
    logSuccess(`Se encontraron ${result.data.data.length} clientes`);
  }

  return result.success;
}

// 7. Obtener cliente por ID
async function testGetCustomerById() {
  logSection('7. OBTENER CLIENTE POR ID');

  if (!customerId) {
    logError('No hay customerId disponible.');
    return false;
  }

  const result = await makeRequest('GET', `/customers/${customerId}`, null, true);

  if (result.success) {
    logSuccess(`Cliente encontrado: ${result.data.name}`);
  }

  return result.success;
}

// 8. Crear Deuda
async function testCreateDebt() {
  logSection('8. CREAR DEUDA');

  if (!siteId || !customerId || !userId) {
    logError('Faltan datos necesarios para crear la deuda.');
    return false;
  }

  const debtData = {
    siteId: siteId,
    customerId: customerId,
    createdByUserId: userId,
    totalAmount: 1500.50,
    description: 'Compra de mercancía variada',
    notes: 'Primera compra del mes'
  };

  const result = await makeRequest('POST', '/debts', debtData, true);

  if (result.success && result.data.data && result.data.data.id) {
    debtId = result.data.data.id;
    logSuccess(`Deuda creada con ID: ${debtId}`);
    if (result.data.data.stellarTxHash) {
      logSuccess(`Hash de blockchain: ${result.data.data.stellarTxHash}`);
    }
  }

  return result.success;
}

// 9. Obtener todas las deudas
async function testGetDebts() {
  logSection('9. OBTENER TODAS LAS DEUDAS');

  const result = await makeRequest('GET', '/debts', null, true);

  if (result.success) {
    logSuccess(`Se encontraron ${result.data.length} deudas`);
  }

  return result.success;
}

// 10. Obtener deuda por ID
async function testGetDebtById() {
  logSection('10. OBTENER DEUDA POR ID');

  if (!debtId) {
    logError('No hay debtId disponible.');
    return false;
  }

  const result = await makeRequest('GET', `/debts/${debtId}`, null, true);

  if (result.success) {
    logSuccess(`Deuda encontrada - Total: $${result.data.totalAmount}, Pendiente: $${result.data.pendingAmount}`);
  }

  return result.success;
}

// 11. Registrar Pago
async function testRegisterPayment() {
  logSection('11. REGISTRAR PAGO');

  if (!debtId) {
    logError('No hay debtId disponible.');
    return false;
  }

  const paymentData = {
    amount: 500.00,
    paymentType: 'cash',
    notes: 'Pago parcial en efectivo'
  };

  const result = await makeRequest('PATCH', `/debts/${debtId}/pay`, paymentData, true);

  if (result.success) {
    logSuccess(`Pago registrado - Pagado: $${result.data.paidAmount}, Pendiente: $${result.data.pendingAmount}`);
    if (result.data.stellarTxHash) {
      logSuccess(`Hash de blockchain: ${result.data.stellarTxHash}`);
    }
  }

  return result.success;
}

// 12. Actualizar Cliente
async function testUpdateCustomer() {
  logSection('12. ACTUALIZAR CLIENTE');

  if (!customerId) {
    logError('No hay customerId disponible.');
    return false;
  }

  const updateData = {
    id: customerId,
    notes: 'Cliente VIP - Actualizado',
    zipCode: '06100'
  };

  const result = await makeRequest('PUT', '/customers', updateData, true);

  if (result.success) {
    logSuccess('Cliente actualizado correctamente');
  }

  return result.success;
}

// 13. Obtener usuarios por site
async function testGetUsersBySite() {
  logSection('13. OBTENER USUARIOS POR SITE');

  if (!siteId) {
    logError('No hay siteId disponible.');
    return false;
  }

  const result = await makeRequest('GET', `/users/siteId/${siteId}`, null, true);

  if (result.success) {
    logSuccess(`Se encontraron ${result.data.length} usuarios en el site`);
  }

  return result.success;
}

// 14. Obtener clientes por site
async function testGetCustomersBySite() {
  logSection('14. OBTENER CLIENTES POR SITE');

  if (!siteId) {
    logError('No hay siteId disponible.');
    return false;
  }

  const result = await makeRequest('GET', `/customers/site/${siteId}`, null, true);

  if (result.success) {
    logSuccess(`Se encontraron ${result.data.length} clientes en el site`);
  }

  return result.success;
}

// 15. Logout
async function testLogout() {
  logSection('15. LOGOUT');

  const result = await makeRequest('POST', '/auth/logout', null, true);

  if (result.success) {
    logSuccess('Logout exitoso');
    authCookie = '';
  }

  return result.success;
}

// Ejecutar todas las pruebas
async function runAllTests() {
  log('\n🚀 INICIANDO PRUEBAS DE API\n', colors.blue);

  const tests = [
    testCreateSite,
    testCreateUser,
    testLogin,
    testValidateSession,
    testCreateCustomer,
    testGetCustomers,
    testGetCustomerById,
    testCreateDebt,
    testGetDebts,
    testGetDebtById,
    testRegisterPayment,
    testUpdateCustomer,
    testGetUsersBySite,
    testGetCustomersBySite,
    testLogout
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test();
      if (result) {
        passed++;
      } else {
        failed++;
      }
      // Pequeña pausa entre pruebas
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      logError(`Error en prueba: ${error.message}`);
      failed++;
    }
  }

  logSection('RESUMEN DE PRUEBAS');
  logSuccess(`Pruebas exitosas: ${passed}`);
  if (failed > 0) {
    logError(`Pruebas fallidas: ${failed}`);
  }
  log(`Total: ${passed + failed}`, colors.blue);
}

// Verificar que el servidor esté corriendo
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Iniciar pruebas
(async () => {
  log('Verificando que el servidor esté corriendo...', colors.yellow);
  const serverRunning = await checkServer();

  if (!serverRunning) {
    logError(`El servidor no está corriendo en ${BASE_URL}`);
    logInfo('Ejecuta: npm run start:dev');
    process.exit(1);
  }

  logSuccess('Servidor detectado ✓\n');
  await runAllTests();
})();
