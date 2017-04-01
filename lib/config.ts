export let options = {
    Platforms: {
        SLACK: 'slack',
        MESSENGER: 'messenger'
    }
};

export interface Config {
    [key: string]: any;

}