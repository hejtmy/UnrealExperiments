#randomising eggo allo sequence
set.seed(666)
egoallo = c(rep("ego", 20),rep("allo", 20))
final = sample(egoallo,replace=T)
a = paste(shQuote(final,type="cmd"),collapse=",")
cat(a)