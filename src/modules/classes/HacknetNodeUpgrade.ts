export abstract class HacknetNodeUpgrade {
  protected _price: number = 0;

  constructor(protected ns: NS) {
  }

  public get price(): number {
    return this._price;
  }


  public abstract upgrade(): boolean;
  public abstract toString(): string;
}

export class HacknetNewNodeUpgrade extends HacknetNodeUpgrade {
  constructor(ns: NS) {
    super(ns);
    this._price = this.ns.hacknet.getPurchaseNodeCost();
  }

  public upgrade(): boolean {
    const result: number = this.ns.hacknet.purchaseNode();
    if (result < 0) {
      return false;
    }
    return true;
  }

  public toString(): string {
    return "New node upgrade. Cost: " + this._price;
  }
}

export class HacknetNodeLevelUpgrade extends HacknetNodeUpgrade {
  constructor(ns: NS, private _index: number) {
    super(ns);
    this._price = this.ns.hacknet.getLevelUpgradeCost(_index);
  }

  public upgrade(): boolean {
    return this.ns.hacknet.upgradeLevel(this._index);
  }

  public toString(): string {
    return "Node " + this._index + " level upgrade. Cost: " + this._price;
  }
}

export class HacknetNodeRamUpgrade extends HacknetNodeUpgrade {
  constructor(ns: NS, private _index: number) {
    super(ns);
    this._price = this.ns.hacknet.getRamUpgradeCost(_index);
  }

  public upgrade(): boolean {
    return this.ns.hacknet.upgradeRam(this._index);
  }

  public toString(): string {
    return "Node " + this._index + " ram upgrade. Cost: " + this._price;
  }
}

export class HacknetNodeCoreUpgrade extends HacknetNodeUpgrade {
  constructor(ns: NS, private _index: number) {
    super(ns);
    this._price = this.ns.hacknet.getCoreUpgradeCost(_index);
  }

  public upgrade(): boolean {
    return this.ns.hacknet.upgradeCore(this._index);
  }

  public toString(): string {
    return "Node " + this._index + " core upgrade. Cost: " + this._price;
  }
}