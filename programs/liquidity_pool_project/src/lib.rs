#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;

pub use instructions::init_pool::*;
pub use instructions::pyth_price::*;


declare_id!("FHwf7xdGuaK7DS2fQ6a76hGvEZVqwSet6JUPq2Kr34nK");

#[program]
pub mod liquidity_pool_project {
    use super::*;

    pub fn initialize_liquidity_pool(ctx: Context<InitializeLiquidityPool>, fees: u8) -> Result<()> {
        ctx.accounts.init_liquidit_pool(fees, &ctx.bumps)
    }

    pub fn get_price(ctx: Context<PythPriceAccount>, feed_id: Pubkey) -> Result<()> {
        instructions::pyth_price::get_price(ctx, feed_id)
    }
}
