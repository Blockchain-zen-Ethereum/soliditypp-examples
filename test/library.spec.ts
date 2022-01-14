import { describe } from "mocha";
import { expect } from "chai";
import * as compiler from "../src/compiler";
import * as vite from "../src/vite";
import config from "./vite.config.json";
import { sleep } from "../src/utils";

let provider: any;
let deployer: any;

describe('test library', () => {
  before(async function() {
    provider = vite.localProvider();
    deployer = vite.newAccount(config.networks.local.mnemonic, 0);
  });

  it('test library', async () => {
    // compile
    const compiledContracts = await compiler.compile('library.solpp');
    expect(compiledContracts).to.have.property('A');
    expect(compiledContracts).to.have.property('L');

    // deploy L
    let lib = compiledContracts.L;
    lib.setDeployer(deployer).setProvider(provider);
    await lib.deploy({});
    expect(lib.address).to.be.a('string');
    // console.log('L:', lib.address);

    // deploy A
    let a = compiledContracts.A;
    a.setDeployer(deployer).setProvider(provider);
    await a.deploy({libraries: {"library.solpp:L": lib.address}});
    expect(a.address).to.be.a('string');
    // console.log('A:', a.address);

    // call A.f(11);
    await a.call('f', ['11'], {});

    // check value of data
    let result = await a.query('data', []);
    expect(result).to.be.deep.equal(['22']);
  });
});