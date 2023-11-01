// We are using a class instead of an enum because we need to use the values as string, but we need to map it enum alike
export class NftType {
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  static ERC721: string = 'ERC721'
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  static ERC1155: string = 'ERC1155'
}
