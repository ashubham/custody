describe('This is a sample test', () => {
    it('Sample test 1', () => {
        csty.postMessage('This is a test message');
        csty.waitForResponseToBe({
            text: 'yo'
        });
        expect(csty.getLastMessage()).toEqual(
            jasmine.objectContaining({
                payload: {
                    body: 'yo'
                }
            })
        );
    });
});
