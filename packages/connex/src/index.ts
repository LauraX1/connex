import { Framework } from '@vechain/connex-framework'
import { genesisBlocks } from './config'
import { compat1 } from './compat'
import { createFull, DriverVendorOnly } from './driver'
import { newVendor } from '@vechain/connex-framework'

/** convert options.network to Connex.Thor.Block */
function normalizeNetwork(n: Options['network']) {
    n = n || 'main'
    if (typeof n === 'string') {
        const gb = genesisBlocks[n]
        if (!gb) {
            throw new Error('invalid network')
        }
        return gb
    } else {
        return n
    }
}

/** convert network name to genesis id */
function normalizeGenesisId(id?: 'main' | 'test' | string) {
    id = id || 'main'
    if (/^0x[0-9a-f]{64}$/.test(id)) {
        return id
    }
    const gb = genesisBlocks[id as 'main' | 'test']
    if (gb) {
        return gb.id
    }
    throw new Error('invalid genesis id')
}

/** Vendor class which can work standalone to provides signing-services only */
class VendorClass implements Connex.Vendor {
    sign !: Connex.Vendor['sign']
    constructor(genesisId?: 'main' | 'test' | string) {
        genesisId = normalizeGenesisId(genesisId)
        try {
            // to detect injected connex
            const injected = ((window || {}) as any).connex
            if (injected && injected.thor.genesis.id === genesisId) {
                // injected genesis id matched
                if (/^1\./.test(injected.version)) {
                    // wrap v1 vendor to v2
                    return compat1(injected).vendor
                }
                return injected.vendor
            }
        } catch { /**/ }

        const driver = new DriverVendorOnly(genesisId)
        const vendor = newVendor(driver)
        return {
            get sign() {
                return vendor.sign.bind(vendor)
            }
        }
    }
}

/** options for creating Connex object */
export type Options = {
    /** the base url of the thor node's thorREST API */
    node: string
    /**
     * the expected network of the node url. defaults to 'main' if omitted.
     * if it does not match with the actual network of the node url points to,
     * all subsequent request will fail.
     */
    network?: 'main' | 'test' | Connex.Thor.Block
}

/** Connex class */
class ConnexClass implements Connex {
    static readonly Vendor = VendorClass

    thor!: Connex.Thor
    vendor!: Connex.Vendor

    constructor(opts: Options) {
        const genesis = normalizeNetwork(opts.network)
        try {
            // to detect injected connex
            const injected = ((window || {}) as any).connex
            if (injected && injected.thor.genesis.id === genesis.id) {
                // injected genesis id matched
                if (/^1\./.test(injected.version)) {
                    // wrap v1 to v2
                    return compat1(injected)
                }
                return injected
            }
        } catch { /**/ }

        const driver = createFull(opts.node, genesis)
        const framework = new Framework(driver)
        return {
            get thor() { return framework.thor },
            get vendor() { return framework.vendor }
        }
    }
}

export default ConnexClass
export { ConnexClass as Connex }
