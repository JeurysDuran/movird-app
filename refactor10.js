const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/context/AppContext.js');
let text = fs.readFileSync(file, 'utf8');

// Añadir [settings, setSettings] en AppProvider
const settingStateDef = `    const [settings, setSettings] = useState(() => LS.get('movird_settings', {
        basePriceOMSA: 15,
        basePriceConcho: 50,
        basePriceMetro: 35,
        basePriceTeleferico: 20,
        simulationSpeed: 'Normal',
        enableTrafficAlerts: true
    }));
    useEffect(() => { LS.set('movird_settings', settings); }, [settings]);
    const updateSettings = useCallback((newConf) => setSettings(newConf), []);
`;

if (!text.includes('movird_settings')) {
    text = text.replace(/const \[activePanel, setActivePanel\] = useState\(null\);/, 
        settingStateDef + "\n    const [activePanel, setActivePanel] = useState(null);"
    );
    
    // Y exponerlos en el Provider value={...}
    text = text.replace(/value=\{\{/m, "value={{ settings, updateSettings, ");
}

fs.writeFileSync(file, text);
