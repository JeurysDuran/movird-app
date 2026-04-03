const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/context/AppContext.js');
let text = fs.readFileSync(file, 'utf8');

const newLoginStr = `
    const login = useCallback(async (email, password) => {
        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if(res.ok) {
                setCurrentUser(data.user);
                LS.set('movird_token', data.token);
                showToast('Bienvenido, ' + data.user.name, 'accent');
                return true;
            } else {
                showToast(data.msg || 'Error de credenciales', 'danger');
                return false;
            }
        } catch(err) {
            console.error(err);
            showToast('Error de conexión al servidor', 'danger');
            return false;
        }
    }, [showToast]);
`;

const newRegisterStr = `
    const registerUser = useCallback(async (name, email, password) => {
        try {
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ name, email, password, role: 'Passenger' })
            });
            const data = await res.json();
            if(res.ok) {
                setCurrentUser(data.user);
                LS.set('movird_token', data.token);
                showToast('Cuenta creada con éxito', 'accent');
                return true;
            } else {
                showToast(data.msg || 'Error al registrar', 'danger');
                return false;
            }
        } catch (err) {
            console.error(err);
            showToast('Error de conexión al servidor', 'danger');
            return false;
        }
    }, [showToast]);
`;

const newLogoutStr = `
    const logout = useCallback(() => {
        setCurrentUser(null);
        LS.del('movird_session');
        LS.del('movird_token');
        setActivePanel(null);
        setActiveSidePanel(null);
        setUserLocation(null);
        showToast('Sesión cerrada', 'accent');
    }, [showToast]);
`;

// Replace `const login = useCallback((email, password) => { ... }, [users, showToast]);`
text = text.replace(/const login = useCallback\(\(email, password\) => \{[\s\S]*?\}, \[users, showToast\]\);/m, newLoginStr.trim());

// Replace registerUser
text = text.replace(/const registerUser = useCallback\(\(name, email, password\) => \{[\s\S]*?\}, \[users, showToast\]\);/m, newRegisterStr.trim());

// Replace logout
text = text.replace(/const logout = useCallback\(\(\) => \{[\s\S]*?\}, \[showToast\]\);/m, newLogoutStr.trim());

fs.writeFileSync(file, text);
