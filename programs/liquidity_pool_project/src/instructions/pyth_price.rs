use anchor_lang::prelude::*;
use pyth_solana_receiver_sdk::price_update::{
    PriceUpdateV2,
    get_feed_id_from_hex
};

#[derive(Accounts, AnchorDeserialize, AnchorSerialize)]
pub struct PythPriceAccount<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    pub price_update: Account<'info, PriceUpdateV2>,
}

pub fn get_price(ctx: Context<PythPriceAccount>, feed_id: String) -> Result<()> {
     let price_update = &ctx.accounts.price_update;

     let feed_id: [u8; 32] = get_feed_id_from_hex(&feed_id)?;
    
     let price = price_update.get_price_unchecked(&feed_id)?;

     msg!("The price is ({} ± {}) * 10^{}", price.price, price.conf, price.exponent);

     let exact_price = (price.price as f64) * 10f64.powi(price.exponent);

     msg!("BTC exact price: {}", exact_price);

     Ok(())
 }
