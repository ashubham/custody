describe('This is a sample test', () => {
    it('Sample test 1', () => {
        app.postMessage('This is a test message');
        app.waitForResponseToMatch({
            text: 'yo'
        });
        expect(app.getLastMessage()).toEqual(
            jasmine.objectContaining({
                payload: {
                    body: 'yo'
                }
            })
        );
    });
});
