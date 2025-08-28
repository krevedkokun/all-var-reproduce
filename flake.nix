{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
  };

  outputs = { self, nixpkgs }: let
    system = "aarch64-darwin";
    pkgs = import nixpkgs { inherit system; };
  in
    {
      devShells.${system} = {
        default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs_22
            corepack
            yarn
            typescript-language-server
          ];

          shellHook = ''
            mkdir -p $out/bin/
            corepack enable --install-directory=$out/bin
            yarn set version berry
          '';
        };
      };
    };
}
