```html
<Device {adapterOptions} {deviceOptions}>
    <div slot="fallback"></div>

    <Module {label} {code}>
        <UniformBuffer {label} {data} />
        <PingPongBuffer {labels} {data} />
        <ResultBuffer {maxBytes} on:result />

        <PipeLine {name} />
        <PipeLine {name} />
        <PipeLine {name} />
    </Module>
</Device>
```

TODO: iterative process
