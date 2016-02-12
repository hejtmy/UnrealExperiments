#randomising eggo allo sequence
set.seed(666)
SelectAllocentricTrials  = function(int1,int2){
  #randomising eggo allo sequence
  egoallo = c(rep("ego", 20),rep("allo", 20))
  final = sample(egoallo,replace=T)
  a = paste(shQuote(final,type="cmd"),collapse=",")
  return(a)
}
# > cat(SelectAllocentricTrials(20))
# "ego","allo","ego","allo","allo","allo","ego","allo","ego","allo","ego","allo","ego","allo","ego","ego","allo","allo","allo","ego","ego","ego","allo","ego","ego","allo","ego","allo","ego","ego","ego","allo","ego","allo","allo","ego","ego","allo","allo","allo"
 