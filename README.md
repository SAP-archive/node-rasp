<p align="center">
  <a href="">
    <img alt="Node RASP" src="logo.png" width="200"/>
  </a>
</p>

# Node RASP

A fork of the [Node.js runtime](https://github.com/nodejs/node) with 
additional security mechanisms built-in. Protects your Node.js applications 
from injection attacks such as SQL and NoSQL injection as well as path 
traversal attacks.

## Description
This is SAP's extended version of the Node.js runtime capable of real-time 
attack detection and mitigation. It represents a fully compatible and hardened 
alternative to using plain Node.js. The runtime employs taint-lexical analysis 
for precise mitigation of SQL and NoSQL injection as well as path traversal.

**Basically, we are building 
Runtime Application Self-Protection (RASP) into Node.js**

> Runtime application self-protection (RASP) is a security technology that is 
> built or linked into an application or application runtime environment and is 
> capable of controlling application execution and detecting and preventing 
> real-time attacks. 
> [[GAR17]](https://www.gartner.com/it-glossary/runtime-application-self-protection-rasp/)

## Requirements
Requirements for building are defined in BUILDING.md and provided by the 
official Node.js project.

## Download and Installation
Currently, we cannot provide compiled binaries for download. Please follow 
the build instructions below to get this engine up and running.

### Building

Clone our repository, checkout the branch you want to build and configure 
the project.
```shell
./configure
```

Build the binary by running make (adapt the number of parallel jobs depending 
on your build system).
```shell
make -j4
```

Test the resulting binary with the following two make goals.
```shell
make test test-taint
```

Run the just built Node RASP engine.
```shell
./node
```

See [BUILDING.md](BUILDING.md) for detailed instructions on how to build
Node.js from source. The document also contains a list of
officially supported platforms.

## Limitations
The taint-lexical analysis for precise mitigation and protection of attacks 
against your Node.js application is currently only supported for the 
following modules:

**SQL Injection** - PostgreSQL (pg)

**NoSQL Injection** - MongoDB (mongo-core, mongodb, mongoose)

**Path Traversal** - Internal fs module protected

## Known Issues
The following issues of the node-rasp project are known and not solved in the 
current implementation:

- False-positive, as well as false-negative attack detections, can occur when 
strings from the string table are referenced multiple times. A correct 
evaluation through the underlying dynamic code analysis isn't guaranteed in 
these situations.
- Certain string and buffer functions documented by the 
`make test-taint-failing` goal are not yet supported by the dynamic code 
analysis implementation.

## Support
Please create a [new issue](https://github.com/sap/node-rasp/issues/new) 
if you find any problems. For questions feel free 
to [get in touch](#contributors) with us.

### Upstream
We currently support Node.js LTS 10 and integrate upstream changes as soon as 
possible. We do not support Node.js 11 and the respective upstream changes yet.

### Security
Please directly [reach out to us](#contributors), in case you found a security 
issue caused by our changes. Please reach out to the upstream 
[Node.js project](https://github.com/nodejs/node) in case you found any 
security-related issues in the official Node.js code.

## Contributing
We welcome external contributions including code and documentation. Everyone 
should feel encouraged to discuss issues and features with us in the 
[issues](https://github.com/sap/node-rasp/issues) section as well as to provide 
feedback directly to [us](#contributors).

For contributing directly to the Node.js project, please consider their 
[repository](https://github.com/nodejs/node/) and 
[contributing](https://github.com/nodejs/node/blob/master/CONTRIBUTING.md) 
guidelines.

## Upcoming changes
**Taint Persistence**
The reference form strings and buffers to taint information will in the future 
be implemented through a map-like structure. This will eliminate memory layout 
changes for strings and buffers.

**Taint Propagation**  For the propagation of taint information on strings and 
buffers, the relevant functions will be simply wrapped. This will reduce code 
changes in the central string and buffer implementations.

<a name="contributors"></a>
## Get in touch

#### Contributors
* Patrick Spiegel (patrick.spiegel@sap.com)
* Jonas Zengerle (jonas.zengerle@sap.com)
* Marc Rahn (marc.rahn@sap.com)
* Tobias Simolik (tobias.simolik@sap.com)
* Hannah Keller (hannah.keller@sap.com)

#### Project Manager & Product Owner
* Mathias Essenpreis (mathias.essenpreis@sap.com)
* Heiko Ettelbrück (heiko.ettelbrueck@sap.com)


## License

Copyright (c) 2018 SAP SE or an SAP affiliate company. All rights reserved.
This file is licensed under the Apache Software License, v. 2 except as noted 
otherwise in the [LICENSE](LICENSE) file.
