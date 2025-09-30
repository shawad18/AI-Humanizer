describe('Performance API', () => {
  it('should have performance.now available', () => {
    console.log('typeof performance:', typeof performance);
    console.log('typeof performance.now:', typeof performance?.now);
    console.log('performance.now():', performance?.now?.());
    
    expect(typeof performance).toBe('object');
    expect(typeof performance.now).toBe('function');
    expect(typeof performance.now()).toBe('number');
    expect(performance.now()).toBeGreaterThan(0);
  });
});