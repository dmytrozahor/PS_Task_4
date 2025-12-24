import tracer from 'dd-trace';

tracer.init({
    service: 'book-review-api',
    env: process.env.NODE_ENV,
    version: '1.0.0',

    logInjection: true,

    runtimeMetrics: true,

    sampleRate: 1.0
});

export default tracer;