import { newThor } from './thor'
import { newVendor } from './vendor'
import { version as connexVersion } from '@vechain/connex-types/package.json'
import { newDriverGuard } from './driver-guard'
import { DriverInterface } from './driver-interface'
/**
 * Class implements Connex interface
 */
export class Framework implements Connex {
    /**
     * create a wrapper for driver, to validate responses. it should be helpful to make sure driver is properly
     * implemented in development stage.
     * @param driver the driver to be wrapped
     * @param errorHandler optional error handler. If omitted, error message will be printed via console.warn.
     */
    public static guardDriver(
        driver: DriverInterface,
        errorHandler?: (err: Error) => void
    ) {
        return newDriverGuard(driver, errorHandler)
    }

    public readonly version = connexVersion
    public readonly thor: Connex.Thor
    public readonly vendor: Connex.Vendor

    /**
     * constructor
     * @param driver the driver instance
     */
    constructor(driver: DriverInterface) {
        this.thor = newThor(driver)
        this.vendor = newVendor(driver)
    }
}
