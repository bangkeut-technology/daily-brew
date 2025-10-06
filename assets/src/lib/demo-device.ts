
export function getOrCreateDemoDeviceId() {
    const k = 'demoDeviceId';
    let id = localStorage.getItem(k);
    if (!id) { id = crypto.randomUUID(); localStorage.setItem(k, id); }
    return id;
}
